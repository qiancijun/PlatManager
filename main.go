package main

import (
	"PlatformManager/config"
	"PlatformManager/server"
)

func init() {
	config.InitDatabase()
}

func main() {
	server.WebServer()
}
