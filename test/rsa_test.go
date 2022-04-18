package test

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"testing"
)

var PrivateKey []byte
var PublicKey []byte

func TestRSA(t *testing.T) {
	GenerateRSAKey(1024)
	fmt.Println(string(PrivateKey))
	fmt.Println(string(PublicKey))
	data := []byte("hello world")
	// 加密
	en := encrypt(data, PublicKey)
	fmt.Println(string(en))
	// 解密
	dc := decrypt(en, PrivateKey)
	fmt.Println(string(dc))
}

// 生成 RSA 公钥和私钥
func GenerateRSAKey(bits int) {
	// GenerateKey函数使用随机数据生成器random生成一对具有指定字位数的RSA密钥
	// Reader是一个全局、共享的密码用强随机数生成器
	privateKey, err := rsa.GenerateKey(rand.Reader, bits)
	if err != nil {
		panic(err)
	}
	// 保存私钥，可以存入文件，数据库，这里暂时用变量代替
	// 通过x509标准将得到的ras私钥序列化为ASN.1 的 DER编码字符串
	derStream := x509.MarshalPKCS1PrivateKey(privateKey)
	block := &pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: derStream,
	}
	PrivateKey = pem.EncodeToMemory(block)
	// 保存公钥
	publicKey := privateKey.PublicKey
	derPkix, err := x509.MarshalPKIXPublicKey(&publicKey)
	if err != nil {
		panic(err)
	}
	block = &pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: derPkix,
	}
	PublicKey = pem.EncodeToMemory(block)
}

// RSA 数据加密/解密
// 公钥加密
func encrypt(data, key []byte) []byte {
	block, _ := pem.Decode(key)
	if block == nil {
		panic(errors.New("public key error"))
	}
	pubInterface, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		panic(err)
	}
	pub := pubInterface.(*rsa.PublicKey)
	cipherText, err := rsa.EncryptPKCS1v15(rand.Reader, pub, data)
	if err != nil {
		panic(err)
	}
	return cipherText
}

// 私钥解密
func decrypt(cipherText, key []byte) []byte {
	block, _ := pem.Decode(key)
	if block == nil {
		panic(errors.New("private key error"))
	}
	priv, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		panic(err)
	}
	data, err := rsa.DecryptPKCS1v15(rand.Reader, priv, cipherText)
	if err != nil {
		panic(err)
	}
	return data
}
