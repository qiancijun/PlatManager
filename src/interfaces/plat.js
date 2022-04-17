import axios from 'axios';
import { message } from 'antd';
// 检查 Label 是否唯一
export const checkLabel = (uid, label, callback) => {
    axios.post('/plat/checkLabel', {
        id: uid,
        label,
    }).then(
        ({ data }) => {
            console.log(data);
            if (data.code === 200) {
                // Label 唯一
                callback();
            } else {
                message.error("该Label已被占用");
            }
        },
        err => {
            message.error("网络出错了");
            console.log(err);
        }
    );
}

export const insertPlat = (marker, uid, callback) => {
    // 构造 plat 对象
    const extData = marker.getExtData();
    const { address, label, pos } = extData;
    let plat = {
        user_id: uid,
        label,
        address,
        center: JSON.stringify([pos.lng, pos.lat]),
    };
    // console.log(plat);
    axios.post('/plat/insertPlat', plat).then(
        ({ data }) => {
            if (data.code === 200) {
                callback(data.data.id);
            }
        },
        err => {
            message.error("网络出错了");
            console.log(err);
        }
    );
}

export const insertPath = (id, path, callback) => {
    axios.post("/plat/insertPath", {
        id,
        path: JSON.stringify(path),
    }).then(
        ({ data }) => {
            console.log(data);
            if (data.code == 200) {
                message.success("保存成功");
                callback();
            } else {
                message.error("服务器发生故障，请联系管理人员");
            }
        },
        err => {
            message.err("网络出错了");
            console.log(err);
        }
    );
}

export const listPlats = (id, callback) => {
    axios.post("/plat/listPlats", {
        id,
    }).then(
        ({ data }) => {
            if (data.code == 200) {
                callback(data.data.list);
            } else {
                message.error("服务器发生故障，请联系管理人员");
            }
        },
        err => {
            message.err("网络出错了");
            console.log(err);
        }
    );
}

export const deletePlat = (id, callback) => {
    axios.post("/plat/deletePlat", {
        id: id,
    }).then(
        ({ data }) => {
            console.log(data);
            if (data.code == 200) {
                message.success("删除成功");
                callback();
            } else if (data.code == 1002) {
                message.error("没有该记录");
            }
        },
        err => {
            message.err("网络出错了");
            console.log(err);
        }
    );
}

export const deletePath = (id, callback) => {
    axios.post("/plat/deletePath", {
        id,
    }).then(
        ({ data }) => {
            if (data.code == 200) {
                message.success('删除成功');
                callback();
            } else if (data.code == 1002) {
                message.error("没有该记录");
            }
        },
        err => {
            message.err("网络出错了");
            console.log(err); 
        }
    );
}