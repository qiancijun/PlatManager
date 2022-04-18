package test

import (
	"PlatformManager/service"
	"testing"
)

func init() {
	//config.InitDatabase()
}

func TestQueryPlatByUserIdAndLabel(t *testing.T) {
	res := service.GetPlatFromLabel(1, "1")
	t.Log(res)
}

func TestSQL(t *testing.T) {

}
