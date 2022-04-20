package config_test

import (
	"testing"

	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
)

func TestLoad(t *testing.T) {
	viper.SetConfigName("config")
	viper.SetConfigType("yml")
	viper.AddConfigPath("../")
	err := viper.ReadInConfig()
	require.NoError(t, err)
	require.Equal(t, "hello", viper.GetString("database.url"))
}