package controller

import (
	"PlatformManager/entity"
	"PlatformManager/service"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"strconv"
	"time"
)

var upgrade = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// 解决跨域问题
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func PlatCount(ctx *gin.Context) {
	json := make(map[string]interface{})
	err := ctx.BindJSON(&json)
	if err != nil {
		log.Println("PlatCount 参数绑定错误:", err)
		ctx.JSON(http.StatusInternalServerError, entity.Error(500, "参数绑定失败").Put("error", err))
		return
	}
	id, err := strconv.Atoi(fmt.Sprint(json["id"]))
	if err != nil {
		ctx.JSON(500, "非法提交")
		return
	}
	count, err := service.PlatCount(id)
	if err != nil {
		ctx.JSON(200, entity.Error(1003, err.Error()))
		return
	}
	ctx.JSON(200, entity.Ok().Put("count", count))
}

func UploadModal(ctx *gin.Context) {
	file, err := ctx.FormFile("file")
	if err != nil {
		ctx.JSON(200, entity.Error(2000, err.Error()))
		return
	}
	id, err := strconv.Atoi(ctx.PostForm("id"))
	if err != nil {
		ctx.JSON(200, entity.Error(2000, err.Error()))
		return
	}
	fileName := file.Filename
	filePath := "modals/" + fileName
	log.Println(id, " ", filePath)
	if err = ctx.SaveUploadedFile(file, filePath); err != nil {
		ctx.JSON(200, entity.Error(2000, err.Error()))
		return
	}
	// 更新数据
	err = service.InsertModalUrl(id, "/"+filePath)
	if err != nil {
		ctx.JSON(200, entity.Error(1005, "请求失败").Put("error", err))
		return
	}
	ctx.JSON(200, entity.Ok().Put("url", "/"+filePath))
	return
}

func InsertDataUrl(ctx *gin.Context) {
	json := make(map[string]interface{})
	err := ctx.BindJSON(&json)
	if err != nil {
		log.Println("PlatCount 参数绑定错误:", err)
		ctx.JSON(http.StatusInternalServerError, entity.Error(500, "参数绑定失败").Put("error", err))
		return
	}
	id, err := strconv.Atoi(fmt.Sprint(json["id"]))
	if err != nil {
		ctx.JSON(200, entity.Error(1002, "非法提交"))
		return
	}
	url := fmt.Sprint(json["url"])
	err = service.InsertDataUrl(id, url)
	if err != nil {
		log.Println(err)
		ctx.JSON(200, entity.Error(1005, err.Error()))
		return
	}
	ctx.JSON(200, entity.Ok())
}

func WebSocket(c *gin.Context) {
	conn, err := upgrade.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.Writer.WriteString(err.Error())
		return
	}
	defer conn.Close()
	for {
		//mt, message, err := conn.ReadMessage()
		//if err != nil {
		//	log.Println("read:", err)
		//	break
		//}
		//log.Printf("recv: %s", message)
		
		d := service.MakeData()
		data, _ := json.Marshal(d)
		err = conn.WriteMessage(1, data)
		if err != nil {
			log.Println("write:", err)
			break
		}
		time.Sleep(10 * time.Second)
	}
}

func Modal1(c *gin.Context) {
	conn, err := upgrade.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.Writer.WriteString(err.Error())
		return
	}
	defer conn.Close()
	for {
		d := service.Modal1()
		err = conn.WriteJSON(d)
		if err != nil {
			log.Println("write:", err)
			break
		}
		time.Sleep(10 * time.Second)
	}
}