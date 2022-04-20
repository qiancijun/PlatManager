package config

import (
	"fmt"
	"log"

	_ "github.com/bmizerany/pq"
	"github.com/spf13/viper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// const (
// 	host   = "192.168.74.201"
// 	port   = 5432
// 	user   = "postgres"
// 	passwd = "20010206qianci"
// 	dname  = "postgres"
// )

var DB *gorm.DB
var err error

func InitDatabase() {
	var host, user, passwd, dname string
	var port int

	// 读取 viper
	host = viper.GetString("database.host")
	user = viper.GetString("database.user")
	passwd = viper.GetString("database.passwd")
	dname = viper.GetString("database.dname")
	port = viper.GetInt("database.port")

	pgInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Shanghai",
		host, port, user, passwd, dname)
	DB, err = gorm.Open(postgres.Open(pgInfo), &gorm.Config{})
	if err != nil {
		log.Fatalln("初始化数据库出错")
		return
	}
}
