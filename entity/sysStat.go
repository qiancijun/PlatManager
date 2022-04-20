package entity

import (
	"bufio"
	"errors"
	"io/ioutil"
	"os"
	"runtime"
	"strconv"
	"strings"
)

type SysStat struct {
	// /proc/loadavg
	Load1  float64
	Load5  float64
	Load15 float64
	// /proc/meminfo
	Total       uint64
	Available   uint64
	Used        uint64
	UsedPercent float64
	Free        uint64
	Active      uint64
	Inactive    uint64
	Buffers     uint64
	Cached      uint64
	Wired       uint64
	Shared      uint64
	// /proc/net/dev
	// sum of all interfaces
	Name        string
	BytesSent   uint64
	BytesRecv   uint64
	PacketsSent uint64
	PacketsRecv uint64
	// /proc/stat
	CPU       string
	User      float64
	System    float64
	Idle      float64
	Nice      float64
	Iowait    float64
	Irq       float64
	Softirq   float64
	Steal     float64
	Guest     float64
	GuestNice float64
	Stolen    float64
}

func GetSysStat() *SysStat {
	if runtime.GOOS == "windows" {
		return nil
	}
	stat := new(SysStat)
	stat.cPUTimes()
	stat.netIOCounters()
	stat.VirtualMemory()
	stat.loadAvg()
	return stat
}

func (stat *SysStat) cPUTimes() error {
	filename := "/proc/stat"
	var lines = []string{}
	lines, _ = readLinesOffsetN(filename, 0, 1)

	err := stat.parseStatLine(lines[0])
	if err != nil {
		return err
	}
	return nil
}

func (stat *SysStat) parseStatLine(line string) error {
	fields := strings.Fields(line)

	if strings.HasPrefix(fields[0], "cpu") == false {
		return errors.New("not contain cpu")
	}

	cpu := fields[0]
	if cpu == "cpu" {
		cpu = "cpu-total"
	}
	user, err := strconv.ParseFloat(fields[1], 64)
	if err != nil {
		return err
	}
	nice, err := strconv.ParseFloat(fields[2], 64)
	if err != nil {
		return err
	}
	system, err := strconv.ParseFloat(fields[3], 64)
	if err != nil {
		return err
	}
	idle, err := strconv.ParseFloat(fields[4], 64)
	if err != nil {
		return err
	}
	iowait, err := strconv.ParseFloat(fields[5], 64)
	if err != nil {
		return err
	}
	irq, err := strconv.ParseFloat(fields[6], 64)
	if err != nil {
		return err
	}
	softirq, err := strconv.ParseFloat(fields[7], 64)
	if err != nil {
		return err
	}
	stolen, err := strconv.ParseFloat(fields[8], 64)
	if err != nil {
		return err
	}

	cpu_tick := float64(100) // TODO: how to get _SC_CLK_TCK ?

	stat.CPU = cpu
	stat.User = float64(user) / cpu_tick
	stat.Nice = float64(nice) / cpu_tick
	stat.System = float64(system) / cpu_tick
	stat.Idle = float64(idle) / cpu_tick
	stat.Iowait = float64(iowait) / cpu_tick
	stat.Irq = float64(irq) / cpu_tick
	stat.Softirq = float64(softirq) / cpu_tick
	stat.Stolen = float64(stolen) / cpu_tick

	if len(fields) > 9 { // Linux >= 2.6.11
		steal, err := strconv.ParseFloat(fields[9], 64)
		if err != nil {
			return err
		}
		stat.Steal = float64(steal)
	}
	if len(fields) > 10 { // Linux >= 2.6.24
		guest, err := strconv.ParseFloat(fields[10], 64)
		if err != nil {
			return err
		}
		stat.Guest = float64(guest)
	}
	if len(fields) > 11 { // Linux >= 3.2.0
		guestNice, err := strconv.ParseFloat(fields[11], 64)
		if err != nil {
			return err
		}
		stat.GuestNice = float64(guestNice)
	}

	return nil
}

type netIOCountersStat struct {
	Name        string
	BytesSent   uint64
	BytesRecv   uint64
	PacketsSent uint64
	PacketsRecv uint64
}

func (stat *SysStat) netIOCounters() error {
	filename := "/proc/net/dev"
	lines, err := readLines(filename)
	if err != nil {
		return err
	}

	statlen := len(lines) - 1

	all := make([]netIOCountersStat, 0, statlen)

	for _, line := range lines[2:] {
		parts := strings.SplitN(line, ":", 2)
		if len(parts) != 2 {
			continue
		}
		interfaceName := strings.TrimSpace(parts[0])
		if interfaceName == "" {
			continue
		}

		fields := strings.Fields(strings.TrimSpace(parts[1]))
		bytesRecv, err := strconv.ParseUint(fields[0], 10, 64)
		if err != nil {
			return err
		}
		packetsRecv, err := strconv.ParseUint(fields[1], 10, 64)
		if err != nil {
			return err
		}
		bytesSent, err := strconv.ParseUint(fields[8], 10, 64)
		if err != nil {
			return err
		}
		packetsSent, err := strconv.ParseUint(fields[9], 10, 64)
		if err != nil {
			return err
		}

		nic := netIOCountersStat{
			Name:        interfaceName,
			BytesRecv:   bytesRecv,
			PacketsRecv: packetsRecv,
			BytesSent:   bytesSent,
			PacketsSent: packetsSent}

		all = append(all, nic)
	}

	return stat.getNetIOCountersAll(all)
}

func (stat *SysStat) getNetIOCountersAll(n []netIOCountersStat) error {
	stat.Name = "all-interfaces"
	for _, nic := range n {
		stat.BytesRecv += nic.BytesRecv
		stat.PacketsRecv += nic.PacketsRecv
		stat.BytesSent += nic.BytesSent
		stat.PacketsSent += nic.PacketsSent
	}
	return nil
}

func (stat *SysStat) VirtualMemory() error {
	filename := "/proc/meminfo"
	lines, _ := readLines(filename)

	for _, line := range lines {
		fields := strings.Split(line, ":")
		if len(fields) != 2 {
			continue
		}
		key := strings.TrimSpace(fields[0])
		value := strings.TrimSpace(fields[1])
		value = strings.Replace(value, " kB", "", -1)

		t, err := strconv.ParseUint(value, 10, 64)
		if err != nil {
			return err
		}
		switch key {
		case "MemTotal":
			stat.Total = t * 1000
		case "MemFree":
			stat.Free = t * 1000
		case "Buffers":
			stat.Buffers = t * 1000
		case "Cached":
			stat.Cached = t * 1000
		case "Active":
			stat.Active = t * 1000
		case "Inactive":
			stat.Inactive = t * 1000
		}
	}
	stat.Available = stat.Free + stat.Buffers + stat.Cached
	stat.Used = stat.Total - stat.Free
	stat.UsedPercent = float64(stat.Total-stat.Available) / float64(stat.Total) * 100.0

	return nil
}

func (stat *SysStat) loadAvg() error {
	filename := "/proc/loadavg"
	line, err := ioutil.ReadFile(filename)
	if err != nil {
		return err
	}

	values := strings.Fields(string(line))

	load1, err := strconv.ParseFloat(values[0], 64)
	if err != nil {
		return err
	}
	load5, err := strconv.ParseFloat(values[1], 64)
	if err != nil {
		return err
	}
	load15, err := strconv.ParseFloat(values[2], 64)
	if err != nil {
		return err
	}

	stat.Load1 = load1
	stat.Load5 = load5
	stat.Load15 = load15

	return nil
}

// ReadLines reads contents from file and splits them by new line.
// A convenience wrapper to ReadLinesOffsetN(filename, 0, -1).
func readLines(filename string) ([]string, error) {
	return readLinesOffsetN(filename, 0, -1)
}

// ReadLines reads contents from file and splits them by new line.
// The offset tells at which line number to start.
// The count determines the number of lines to read (starting from offset):
//   n >= 0: at most n lines
//   n < 0: whole file
func readLinesOffsetN(filename string, offset uint, n int) ([]string, error) {
	f, err := os.Open(filename)
	if err != nil {
		return []string{""}, err
	}
	defer f.Close()

	var ret []string

	r := bufio.NewReader(f)
	for i := 0; i < n+int(offset) || n < 0; i++ {
		line, err := r.ReadString('\n')
		if err != nil {
			break
		}
		if i < int(offset) {
			continue
		}
		ret = append(ret, strings.Trim(line, "\n"))
	}

	return ret, nil
}