package controller

import (
	"PlatformManager/entity"
	"PlatformManager/service"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"strconv"
)

/**
POST 请求： 检查 Label 唯一性
*/
func CheckLabelAvailable(ctx *gin.Context) {
	// 1. 获取前端传递的 label 与 用户 id
	json := make(map[string]interface{})
	err := ctx.BindJSON(&json)
	if err != nil {
		log.Println("CheckLabelAvailable 参数绑定错误:", err)
		ctx.JSON(http.StatusInternalServerError, entity.Error(500, "参数绑定失败").Put("error", err))
		return
	}
	id, _ := strconv.Atoi(fmt.Sprint(json["id"]))
	label := fmt.Sprint(json["label"])
	vaild := service.GetPlatFromLabel(id, label)
	if !vaild {
		log.Println(vaild)
		ctx.JSON(200, entity.Error(1000, "Label被占用"))
		return
	}
	ctx.JSON(200, entity.Ok())
}

func InsertPlat(ctx *gin.Context) {
	var json *entity.Plat
	err := ctx.BindJSON(&json)
	if err != nil {
		log.Println("InsertPlat 参数绑定错误:", err)
		ctx.JSON(http.StatusInternalServerError, entity.Error(500, "参数绑定失败").Put("error", err))
		return
	}
	id, err := service.InsertPlat(json)
	if err != nil {
		log.Println("InsertPlat 插入失败:", err)
		ctx.JSON(http.StatusInternalServerError, entity.Error(500, "插入失败").Put("error", err))
		return
	}
	ctx.JSON(200, entity.Ok().Put("id", id))
	return
	//log.Println(json)
}

func InsertPath(ctx *gin.Context) {
	json := make(map[string]interface{})
	err := ctx.BindJSON(&json)
	if err != nil {
		log.Println("InsertPath 参数绑定错误:", err)
		ctx.JSON(http.StatusInternalServerError, entity.Error(500, "参数绑定失败").Put("error", err))
		return
	}
	id, err := strconv.Atoi(fmt.Sprint(json["id"]))
	if err != nil {
		ctx.JSON(500, "非法提交")
		return
	}
	path := fmt.Sprint(json["path"])
	err = service.InsertPath(id, path)
	if err != nil {
		ctx.JSON(200, entity.Error(1001, "插入区块出错").Put("error", err))
		return
	}
	ctx.JSON(200, entity.Ok())
}

func QueryPlatByUserId(ctx *gin.Context) {
	json := make(map[string]interface{})
	err := ctx.BindJSON(&json)
	if err != nil {
		log.Println("QueryPlatByUserId 参数绑定错误:", err)
		ctx.JSON(http.StatusInternalServerError, entity.Error(500, "参数绑定失败").Put("error", err))
		return
	}
	id, err := strconv.Atoi(fmt.Sprint(json["id"]))
	if err != nil {
		ctx.JSON(500, "非法提交")
		return
	}
	plats := service.QueryPlatByUserId(id)
	ctx.JSON(200, entity.Ok().Put("list", plats))
}

func DeletePlatById(ctx *gin.Context) {
	json := make(map[string]interface{})
	err := ctx.BindJSON(&json)
	if err != nil {
		log.Println("DeletePlatById 参数绑定错误:", err)
		ctx.JSON(http.StatusInternalServerError, entity.Error(500, "参数绑定失败").Put("error", err))
		return
	}
	id, err := strconv.Atoi(fmt.Sprint(json["id"]))
	if err != nil {
		ctx.JSON(500, "非法提交")
		return
	}
	err = service.DeletePlatById(id)
	if err != nil {
		ctx.JSON(200, entity.Error(1002, "没有该记录"))
		return
	}
	ctx.JSON(200, entity.Ok())
}

func DeletePath(ctx *gin.Context) {
	json := make(map[string]interface{})
	err := ctx.BindJSON(&json)
	if err != nil {
		log.Println("DeletePlatById 参数绑定错误:", err)
		ctx.JSON(http.StatusInternalServerError, entity.Error(500, "参数绑定失败").Put("error", err))
		return
	}
	id, err := strconv.Atoi(fmt.Sprint(json["id"]))
	if err != nil {
		ctx.JSON(500, "非法提交")
		return
	}
	err = service.DeletePath(id)
	if err != nil {
		ctx.JSON(200, entity.Error(1002, "没有该记录"))
		return
	}
	ctx.JSON(200, entity.Ok())
}
