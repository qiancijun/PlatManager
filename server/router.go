package server

import (
	"PlatformManager/controller"
	"PlatformManager/middlewares"
	"github.com/gin-gonic/gin"
	"net/http"
)

func WebServer() {
	router := gin.Default()
	router.Use(middlewares.Cors())
	router.Use(gin.Recovery())
	plat := router.Group("/plat")
	{
		plat.POST("/insertPlat", controller.InsertPlat)
		plat.POST("/checkLabel", controller.CheckLabelAvailable)
		plat.POST("/insertPath", controller.InsertPath)
		plat.POST("/listPlats", controller.QueryPlatByUserId)
		plat.POST("/deletePlat", controller.DeletePlatById)
		plat.POST("/deletePath", controller.DeletePath)
	}
	data := router.Group("/data")
	{
		data.POST("/platCount", controller.PlatCount)
		data.POST("/uploadModal", controller.UploadModal)
		data.POST("/insertDataUrl", controller.InsertDataUrl)
		data.POST("/event", func(context *gin.Context) {
			context.JSON(200, "hello")
		})
		data.GET("/ws", controller.WebSocket)
		data.GET("/modal1", controller.Modal1)
	}
	router.StaticFS("/modals", http.Dir("./modals"))
	router.Run(":8080")
}
