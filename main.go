package main

import (
	"PlatformManager/config"
	"PlatformManager/server"
)

func init() {
	config.LoadConfig()
	config.InitDatabase()
}

func main() {
	server.WebServer()
}
