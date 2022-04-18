package entity

import (
	"PlatformManager/config"
	"errors"
	"log"
	"strconv"
	"time"
)

type Plat struct {
	Id        int       `json:"id" gorm:"primaryKey"`
	UserId    int       `json:"user_id" gorm:"not null"`
	Label     string    `json:"label" gorm:"not null"`
	Address   string    `json:"address" gorm:"not null"`
	Center    string    `json:"center" gorm:"not null"`
	Path      string    `json:"path"`
	ModalUrl  string    `json:"modal_url"`
	DataUrl   string    `json:"data_url"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime:milli"`
}

func NewPlat(userId int, label string, modalUrl string, dataUrl string) *Plat {
	return &Plat{UserId: userId, Label: label, ModalUrl: modalUrl, DataUrl: dataUrl}
}

func (p Plat) String() string {
	return "{" +
		"Id: " + strconv.Itoa(p.Id) + "\n" +
		"UserId: " + strconv.Itoa(p.UserId) + "\n" +
		"Label: " + p.Label + "\n" +
		"Address: " + p.Address + "\n" +
		"ModalUrl: " + p.ModalUrl + "\n" +
		"Center: " + p.Center + "\n" +
		"DataUrl: " + p.DataUrl + "\n" +
		"}"
}

func QueryPlatByUserId(id int) (ps []Plat) {
	config.DB.Where("user_id = ?", id).Find(&ps)
	return
}

func QueryPlatByUserIdAndLabel(id int, label string) bool {
	var count int64
	config.DB.Model(&Plat{}).Where("user_id = ? and label = ?", id, label).Count(&count)
	log.Println(count)
	if count == 0 {
		return true
	}
	return false
}

func InsertPlat(p *Plat) (int, error) {
	res := config.DB.Create(p)
	if res.Error != nil {
		return -1, res.Error
	} else if res.RowsAffected == 0 {
		return -1, errors.New("插入区块失败")
	}
	return p.Id, nil
}

func UpdatePlat(p *Plat) error {
	res := config.DB.Save(p)
	if res.Error != nil {
		return res.Error
	} else if res.RowsAffected == 0 {
		return errors.New("更新区块失败")
	}
	return nil
}

func InsertPath(id int, path string) error {
	res := config.DB.Model(&Plat{}).Where("id = ?", id).Update("path", path)
	if res.Error != nil {
		return res.Error
	} else if res.RowsAffected == 0 {
		return errors.New("更新出错")
	}
	return nil
}

func DeletePath(id int) error {
	res := config.DB.Model(&Plat{}).Where("id = ?", id).Update("path", "")
	if res.Error != nil {
		return res.Error
	} else if res.RowsAffected == 0 {
		return errors.New("更新出错")
	}
	return nil
}

func DeletePlatById(id int) error {
	res := config.DB.Delete(&Plat{}, id)
	if res.Error != nil {
		return res.Error
	} else if res.RowsAffected == 0 {
		return errors.New("没有找到该记录")
	}
	return nil
}

func PlatCount(id int) (int64, error) {
	var count int64
	res := config.DB.Model(&Plat{}).Where("user_id = ?", id).Count(&count)
	if res.Error != nil {
		return -1, res.Error
	}
	return count, nil
}

func InsertModalUrl(id int, url string) error {
	res := config.DB.Model(&Plat{}).Where("id = ?", id).Update("modal_url", url)
	if res.Error != nil {
		return res.Error
	} else if res.RowsAffected == 0 {
		return errors.New("更新出错")
	}
	return nil
}

/*
	根据 id 修改单字段
*/
func UpdateSingleField(id int, field string, value interface{}) error {
	res := config.DB.Model(&Plat{}).Where("id = ?", id).Update(field, value)
	if res.Error != nil {
		return res.Error
	} else if res.RowsAffected == 0 {
		return errors.New("更新出错")
	}
	return nil
}
