package service

import "PlatformManager/entity"

func GetPlatFromLabel(id int, label string) bool {
	return entity.QueryPlatByUserIdAndLabel(id, label)
}

func InsertPlat(p *entity.Plat) (int, error) {
	id, err := entity.InsertPlat(p)
	if err != nil {
		return -1, err
	}
	return id, nil
}

func InsertPath(id int, path string) error {
	return entity.InsertPath(id, path)
}

func QueryPlatByUserId(id int) []entity.Plat {
	return entity.QueryPlatByUserId(id)
}

func DeletePlatById(id int) error {
	return entity.DeletePlatById(id)
}

func DeletePath(id int) error {
	return entity.DeletePath(id)
}

func PlatCount(id int) (int64, error) {
	return entity.PlatCount(id)
}

func InsertModalUrl(id int, url string) error {
	return entity.UpdateSingleField(id, "modal_url", url)
}

func InsertDataUrl(id int, url string) error {
	return entity.UpdateSingleField(id, "data_url", url)
}
