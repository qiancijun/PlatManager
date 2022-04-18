package service

import (
	"PlatformManager/entity"
	"errors"
	"regexp"
	"strings"
)

func Login(username, passwd string) error {
	usr := entity.QueryUserByName(username)
	if usr.Id == 0 {
		return errors.New("用户名不存在")
	}
	correct := strings.Compare(usr.Passwd, passwd)
	if correct != 0 {
		return errors.New("密码错误")
	}
	return nil
}

func Register(u *entity.User) error {
	if !verifyEmail(u.Email) {
		return errors.New("邮箱验证出错")
	}
	err := entity.InsertUser(u)
	if err != nil {
		return err
	}
	return nil
}

func verifyEmail(email string) bool {
	if len(email) > 255 {
		return false
	}
	pattern := `\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*`
	reg := regexp.MustCompile(pattern)
	return reg.MatchString(email)
}
