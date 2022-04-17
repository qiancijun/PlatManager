import React from 'react'
import ReactDOM from 'react-dom';
import axios from "axios"
import { TEngine } from "../../components/TEngine"
import { lightsList } from "@/assets/js/TLights"
import { helpList } from "@/assets/js/THelper"
import { basicObjectList } from "@/assets/js/TObject"
import "./index.scss";
// 模型加载
import { LoadModal } from "@/assets/js/TModal"
import { Mesh, MeshStandardMaterial } from 'three'
import { Button } from 'antd';
// 图片
import closeSVG from "@/assets/imgs/svgs/close.svg"

let json = null;
const data = new Map();
export default function ModalPage(props) {

    let ws = null;
    // Refs
    const canvasRef = React.useRef();
    const infoRef = React.useRef();
    // States
    const [name, setName] = React.useState("");
    const [value, setValue] = React.useState("");
    const [hide, setHide] = React.useState(true);

    React.useEffect(() => {
        initTEngine();
        onConnect();
        return () => {

        }
    }, []);

    function initTEngine() {
        const { modalUrl, dataUrl } = props.location.query;
        const handler = (obj) => {
            if (json == null || !obj.visible) return null;

            const name = obj.name;
            if (data.get(name) == null) return null;
            return data.get(name);
            // if (obj.name != name) {
            //     setName(obj.name);
            //     if (data.get(obj.name) != null ) {
            //         setValue(data.get(obj.name));
            //     } else {
            //         setValue("");
            //     }
            // }

        }
        const TE = new TEngine(canvasRef.current, handler, renderDiv);
        TE.addObject(...lightsList);
        // TE.addObject(...helpList);
        LoadModal(`http://localhost:8080${modalUrl}`, gltf => {
            const s = gltf.scene;
            TE.addObject(s);
        });
    }

    function renderDiv(pos, data) {
        const halfWidth = window.innerWidth / 2;
        const halfHeight = window.innerHeight / 2;

        // 解析 data 中的 event
        const { events, key, value } = data;
        const eventsDom = [];
        const sendPOST = (url) => {
            axios.post(url).then(
                ({ data }) => {
                    console.log(data);
                },
                err => {
                    console.log(err);
                }
            );
        }
        for (let i in events) {
            const { name, url } = events[i];
            const eDom = (
                <div key={name}>
                    <Button type="link" style={{color: "lightblue"}} onClick={() => sendPOST(url)}>{name}</Button>
                    <br />
                </div>
            );
            eventsDom.push(eDom);
        }

        const dom = (
            <div className="info" style={{
                left: pos.x * halfWidth + halfWidth,
                top: -pos.y * halfHeight + halfHeight,
            }}>
                <div>

                    <Button style={{
                        float: "right",
                        marginRight: "5px",
                        marginTop: "5px",
                        overflow: "hidden",
                    }} size="small" type="primary" shape="circle" onClick={() => {
                        setHide(true);
                    }} >
                        <img src={closeSVG} alt="" />
                    </Button>
                </div>
                <p>名称：{key}</p>
                <p>数值：{value}</p>
                <p>事件:</p>
                {eventsDom}
            </div>
        );
        setHide(false);
        ReactDOM.render(dom, infoRef.current);
    }

    function onConnect() {
        if (ws == null) {
            ws = new WebSocket("ws://localhost:8080/data/ws");
            ws.onopen = () => {
                // ws.send("hello");
                console.log("连接成功");
            }
            ws.onclose = () => {
                console.log("连接断开");
            }
            ws.onerror = (e) => {
                console.log(e);
            }
            ws.onmessage = (e) => {
                json = JSON.parse(e.data);
                const { temp } = json;
                for (let i = 0; i < temp.length; i++) {
                    data.set(temp[i].key, temp[i]);
                }
                // console.log(data);
            }
        }
    }

    return (
        <>
            <div ref={infoRef} hidden={hide}></div>
            <div className="three-canvas" ref={canvasRef}></div>
        </>
    )
}
