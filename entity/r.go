package entity

/**
统一结果处理
*/

type R struct {
	Code int                    `json:"code"`
	Msg  string                 `json:"msg"`
	Data map[string]interface{} `json:"data"`
}

func Ok() *R {
	res := R{
		Code: 200,
		Msg:  "success",
		Data: make(map[string]interface{}),
	}
	return &res
}

func Error(c int, m string) *R {
	res := R{
		Code: c,
		Msg:  m,
		Data: make(map[string]interface{}),
	}
	return &res
}

func (res *R) Put(name string, value interface{}) *R {
	res.Data[name] = value
	return res
}
