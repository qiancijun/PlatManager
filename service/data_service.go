package service

import (
	"PlatformManager/entity"
	"fmt"
	"math/rand"
	"time"
)

func MakeData() *entity.Data {
	rand.Seed(time.Now().UnixMicro())
	d := entity.NewData()
	for i := 1; i <= 10; i++ {
		d.CreateTemp(fmt.Sprintf("%d号机器", i), float32(rand.Int63n(140) - 40), nil)
	}
	events := make([]entity.Event, 0)
	events = append(events, entity.Event{
		Name: "开关",
		Url:  "http://localhost:8080/data/event",
	})
	d.CreateTemp("平面", 100, events)

	for i := 1; i <= 5; i++ {
		d.CreateHumidity(fmt.Sprintf("%d土地", i), float32(rand.Int63n(100)), nil)
	}

	for i := 1; i <= 20; i++ {
		d.CreateOther(fmt.Sprintf("%d号机器", i), float32(rand.Int63n(100)), nil)
	}
	return d
}


func Modal1() *entity.Data {
	d := entity.NewData()
	for i := 1; i <= 3; i++ {
		d.CreateTemp(fmt.Sprintf("%d号土地", i), float32(rand.Int63n(10)) + 20, nil)
	}
	// events := make([]entity.Event, 0)
	// events = append(events, entity.Event{
	// 	Name: "开关",
	// 	Url:  "http://localhost:8080/data/event",
	// })
	d.CreateTemp("优质土地", 28, nil)
	d.CreateTemp("翻新土地", 26, nil)
	d.CreateTemp("地板", 29, nil)
	d.CreateTemp("植物", 31, append(make([]entity.Event, 0), entity.Event{
		Name: "浇水",
		Url: "",
	}))

	for i := 1; i <= 5; i++ {
		d.CreateHumidity(fmt.Sprintf("%d土地", i), float32(rand.Int63n(100)), nil)
	}

	// for i := 1; i <= 20; i++ {
	// 	d.CreateOther(fmt.Sprintf("%d号机器", i), float32(rand.Int63n(100)), nil)
	// }
	return d
}