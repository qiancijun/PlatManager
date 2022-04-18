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
