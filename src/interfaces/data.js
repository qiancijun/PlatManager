import axios from 'axios';
import { message } from 'antd';

export const platCount = (callback) => {
    axios.post("/data/platCount", {
        id: 1
    }).then(
        ({ data }) => {
            if (data.code == 200) {
                // console.log(data.data);
                callback(data.data.count);
            }
        },
        err => {
            message.error("网络发生错误");
            console.log(err);
        }
    );
}

export const insertDataUrl = (id, url, callback) => {
    axios.post("/data/insertDataUrl", {
        id,
        url
    }).then(
        ({ data }) => {
            if (data.code == 200) {
                message.success("修改成功");
                callback();
            } else if (data.code == 1005) {

            }
        },
        err => {
            console.log(err);
            message.error("网络发生错误");
        }
    );
}