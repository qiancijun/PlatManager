package config

import (
	"fmt"
	_ "github.com/bmizerany/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
)

const (
	host   = "192.168.74.201"
	port   = 5432
	user   = "postgres"
	passwd = "20010206qianci"
	dname  = "postgres"
)

var DB *gorm.DB
var err error

func InitDatabase() {
	pgInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Shanghai",
		host, port, user, passwd, dname)
	DB, err = gorm.Open(postgres.Open(pgInfo), &gorm.Config{})
	if err != nil {
		log.Fatalln("初始化数据库出错")
		return
	}
}
