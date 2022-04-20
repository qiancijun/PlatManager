package config_test

import (
	"fmt"
	"testing"

	_ "github.com/bmizerany/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
)

func TestDatabase(t *testing.T) {
	var host, user, passwd, dname string
	var port int
	// 读取 viper

	viper.SetConfigName("config")
	viper.SetConfigType("yml")
	viper.AddConfigPath("../")
	err := viper.ReadInConfig()
	require.NoError(t, err)
	require.Equal(t, "139.198.178.2", viper.GetString("database.host"))
	require.Equal(t, "postgres", viper.GetString("database.user"))
	require.Equal(t, "20010206qianci", viper.GetString("database.passwd"))
	require.Equal(t, "postgres", viper.GetString("database.dname"))

	host = viper.GetString("database.host")
	user = viper.GetString("database.user")
	passwd = viper.GetString("database.passwd")
	dname = viper.GetString("database.dname")
	port = viper.GetInt("database.port")

	pgInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Shanghai",
		host, port, user, passwd, dname)
	_, err = gorm.Open(postgres.Open(pgInfo), &gorm.Config{})
	require.NoError(t, err)
}