package test

import (
	"PlatformManager/entity"
	"PlatformManager/service"
	"testing"
)

func TestLogin(t *testing.T) {
	username, passwd := "Cheryl", "123456"
	err := service.Login(username, passwd)
	if err != nil {
		t.Error(err)
	}
}

func TestRegister(t *testing.T) {
	usr := &entity.User{
		Username: "testReg1",
		Email:    "111@qq.com",
		Passwd:   "123",
	}
	err := service.Register(usr)
	if err != nil {
		t.Error(err)
	}
}
