package test

import (
	"PlatformManager/entity"
	"fmt"
	"testing"
)

func init() {
	//config.InitDatabase()
}

func TestInsert(t *testing.T) {
	err := entity.InsertUser(&entity.User{
		Username: "Cheryl",
		Email:    "qiancijun@gamil.com",
		Passwd:   "123456",
	})
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("插入成功")
	}
}

func TestQuery(t *testing.T) {
	user := entity.QueryUserByName("Cheryl")
	fmt.Println(user)
}

func TestUpdate(t *testing.T) {
	user := entity.QueryUserByName("Cheryl")
	user.Email = "qiancijun@gamil.com"
	err := entity.UpdateUser(user)
	if err != nil {
		fmt.Println(err)
	}
}
