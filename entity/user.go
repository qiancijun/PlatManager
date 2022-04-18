package entity

import (
	"PlatformManager/config"
	"errors"
	"strconv"
)

type User struct {
	Id       int    `json:"id" gorm:"primaryKey"`
	Username string `json:"username" gorm:"unique"`
	Email    string `json:"email" gorm:"unique"`
	Passwd   string `json:"-" gorm:"notNull"`
}

func (u User) String() string {
	return "{" +
		"Id: " + strconv.Itoa(u.Id) + " " +
		"Username: " + u.Username + " " +
		"Email: " + u.Email + " " +
		"Passwd: " + u.Passwd + " " +
		"}"
}

func InsertUser(u *User) error {
	res := config.DB.Create(u)
	if res.RowsAffected == 0 {
		return res.Error
	}
	return nil
}

func QueryUserByName(username string) (u *User) {
	config.DB.Where("username = ?", username).Find(&u)
	return
}

func UpdateUser(u *User) error {
	res := config.DB.Save(u)
	if res.Error != nil {
		return res.Error
	} else if res.RowsAffected == 0 {
		return errors.New("更新出错")
	}
	return nil
}
