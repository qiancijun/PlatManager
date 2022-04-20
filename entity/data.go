package entity

type Event struct {
	Name string `json:"name"`
	Url  string `json:"url"`
}

type inner struct {
	Key    string      `json:"key"`
	Value  interface{} `json:"value"`
	Events []Event     `json:"events"`
}

type Data struct {
	Temp     []inner  `json:"temp"`
	Humidity []inner  `json:"humidity"`
	TSP      []inner  `json:"tsp"`
	Other    []inner  `json:"other"`
	SysStat  *SysStat `json:"sysStat"`
}

func NewData() *Data {
	data := &Data{
		Temp:     make([]inner, 0),
		Humidity: make([]inner, 0),
		SysStat:  GetSysStat(),
	}
	return data
}

func (d *Data) CreateTemp(key string, value float32, events []Event) {
	d.Temp = append(d.Temp, inner{
		Key:    key,
		Value:  value,
		Events: events,
	})
}

func (d *Data) CreateHumidity(key string, value float32, events []Event) {
	d.Humidity = append(d.Humidity, inner{
		Key:    key,
		Value:  value,
		Events: events,
	})
}

func (d *Data) CreateTSP(key string, value float32, events []Event) {
	d.TSP = append(d.TSP, inner{
		Key:    key,
		Value:  value,
		Events: events,
	})
}

func (d *Data) CreateOther(key string, value float32, events []Event) {
	d.Other = append(d.Other, inner{
		Key:    key,
		Value:  value,
		Events: events,
	})
}
