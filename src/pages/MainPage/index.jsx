import React from 'react'
import "./index.scss"
import MapComponent from '../../components/MapComponent';
import { Input, message, Tooltip, Popover, Button, Upload } from 'antd';
import { withRouter } from 'react-router-dom'
// 图片引入
import searchSVG from "@/assets/imgs/svgs/search.svg"
import searchMoveSVG from "@/assets/imgs/svgs/search-move.svg"
// Redux
import { useSelector, shallowEqual, useDispatch } from 'react-redux'
import { connect } from 'react-redux'
import { initAmapAction } from '@/redux/actions/map'
// 接口
import { platCount } from '../../interfaces/data';
// 组件
import InsertDataModal from '../../components/Modals/InsertDataModal';

const cardData = new Map();
const features = new Set();
const MainPage = (props) => {
    // 数据相关变量
    const [list, setList] = React.useState(new Array());
    const [backUp, setBackUp] = React.useState(new Array());
    const [mapType, setMapType] = React.useState("normal");
    // 各类 ref
    const dateRef = React.useRef();
    const timeRef = React.useRef();
    const searchRef = React.useRef();
    const searchBtnRef = React.useRef();
    const platCountRef = React.useRef();
    const inserDataModalRef = React.useRef();
    let timer = null;
    // 时钟的逻辑代码
    const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    // ReactDOM
    const searchBtn = React.createElement("img", {
        src: searchSVG
    });
    // Redux

    const { mapState } = useSelector(
        state => {
            return {
                mapState: state.mapState,
            }
        }, shallowEqual
    );
    // 为 searchBtn 添加样式事件
    function searchBtnEvent() {
        searchBtnRef.current.onmouseenter = () => {
            searchBtnRef.current.src = searchMoveSVG;
        }
        searchBtnRef.current.onmouseout = () => {
            searchBtnRef.current.src = searchSVG;
        }
    }


    React.useEffect(() => {
        // DidMount
        searchBtnEvent();
        timer = setInterval(updateTime, 1000);
        updateTime();
        platCount(count => {
            platCountRef.current.innerText = count;
        });
        return () => {
            // 卸载时调用
            if (timer != null) {
                clearInterval(timer)
            }
        }
    }, []);

    // 数字时钟相关代码
    function updateTime() {
        const t = new Date();
        timeRef.current.innerText = zeroPadding(t.getHours(), 2) + ':' + zeroPadding(t.getMinutes(), 2) + ':' + zeroPadding(t.getSeconds(), 2);
        dateRef.current.innerText = zeroPadding(t.getFullYear(), 4) + '-' + zeroPadding(t.getMonth() + 1, 2) + '-' + zeroPadding(t.getDate(), 2) + ' ' + week[t.getDay()];
    }

    function zeroPadding(num, digit) {
        var zero = '';
        for (var i = 0; i < digit; i++) {
            zero += '0';
        }
        return (zero + num).slice(-digit);
    }

    function addPlatCard(marker) {
        
        const extData = marker.getExtData();
        // Methods
        const showModal = (marker) => {
            const extData = marker.getExtData();
            const { modalUrl, dataUrl } = extData;
            if (modalUrl == "") {
                message.warning("没有添加模型文件");
                return;
            } else {
                // 跳转渲染模型页面
                props.history.push({
                    pathname: "/modal",
                    query: {
                        modalUrl,
                        dataUrl
                    }
                });
            }
        }
        const showData = (marker) => {
            const extData = marker.getExtData();
            const { dataUrl } = extData;
            if (dataUrl == "") {
                message.warning("没有添加数据接口");
                return;
            } else {
                // TODO: 跳转渲染模型页面
                props.history.push({
                    pathname: "/data",
                    query: {
                        dataUrl
                    }
                })
            }
        }
        // list
        const area = (
            <p>占地面积: {extData.area}㎡</p>
        );
        const uploadProps = {
            name: marker.label,
            action: "http://localhost:8080/data/uploadModal",
            showUploadList: false,
            data: {
                id: extData.id,
            },
            onChange(info) {
                if (info.file.status !== 'uploading') {
                    // console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    const url = info.file.response.data.url;
                    extData.modalUrl = url;
                    marker.setExtData(extData);
                    message.success(`上传成功`);
                } else if (info.file.status === 'error') {
                    message.error(`上传失败`);
                }
            }
        };
        const dom = (
            <Popover
                key={extData.id}
                content={
                    <>
                        <Upload {...uploadProps}>
                            <Button type="link">上传模型</Button>
                        </Upload>
                        <br />
                        <Button type="link" onClick={() => {
                            inserDataModalRef.current.showModal({
                                id: extData.id,
                                marker,
                            });
                        }}>数据接口</Button>
                        <br />
                        <Button type="link" onClick={() => showModal(marker)}>模型预览</Button>
                        <br />
                        <Button type="link" onClick={() => showData(marker)}>数据展示</Button>
                    </>
                }
                title={extData.label}
                trigger="click"
            >
                <div className="-plat-card" onClick={() => {
                    searchMarker(extData.label);
                }}>
                    <p>名称: {extData.label}</p>
                    {extData.area == 0 ? null : area}
                    <Tooltip title={extData.address}>
                        <p>地理位置: {extData.address}</p>
                    </Tooltip>
                </div>
            </Popover>
        );
        setBackUp([dom, ...backUp]);
        setList([dom, ...list]);
        cardData.set(extData.label, dom);
    }

    // 搜索 Label 查找 Marker
    function searchMarker(label) {
        // 通过从 searchRef 中拿到 Label，从 HashMap 中查找
        const { markers, map } = mapState;
        const marker = markers.get(label);
        if (marker != null || undefined) {
            // 从 marker 身上获取 extraData，里面包含坐标，window等信息
            const { pos } = marker.getExtData();
            // map.setZoom(18);
            map.setCenter(pos);
        } else {
            message.warning("没有该标签的区块");
        }
    }

    function find() {
        const label = searchRef.current.state.value;
        // mapState.markers.forEach(d => console.log(d));
        if (label == "") {
            setList([...backUp]);
        } else {
            setList([cardData.get(label)]);
        }
    }

    function changeMapType(type) {
        const { map } = props.mapState;
        map.setMapStyle('amap://styles/' + type);
        props.mapState.map = map;
        this.props.initMapState(props.mapState);
    }

    function changeMapFeatures(feature) {
        const { map } = props.mapState;
        if (feature == "reset") {
            features.clear();
            map.setFeatures(['road','point','bg','building']);
            props.mapState.map = map;
            this.props.initMapState(props.mapState);
            return;
        }
        if (features.has(feature)) {
            features.delete(feature);
        } else {
            features.add(feature);
        }
        let t = [];
        for (let f of features) {
            t.push(f);
        }
        map.setFeatures(t);
        props.mapState.map = map;
        this.props.initMapState(props.mapState);
    }

    return (
        <div className="main-page">
            <div className="-left-container">
                <div className="-search-box">
                    <Input placeholder="请输入区块标签"
                        bordered={false}
                        style={{ width: '80%', color: '#FFFFFF' }}
                        ref={searchRef} />
                    <img className="search-btn" src={searchSVG} alt="" onClick={() => find()} ref={searchBtnRef} />
                </div>
                <div className="-list-box">
                    {list}
                </div>
            </div>
            <div className="-middle-container">
                <MapComponent addPlatCard={addPlatCard} />
            </div>
            <div className="-right-container">
                <div className="-clock">
                    <p className="date" ref={dateRef}>11</p>
                    <p className="time" ref={timeRef}>11</p>
                </div>
                <div className="-plat-number-box">
                    区块数量：<span className="-number" ref={platCountRef}>0</span>
                </div>
                <div className="-available-number-box">
                    可控实例：<span className="-number">0</span>
                </div>
                <div className="-map-style-choose-box">
                    <div style={{background: "rgba(217,222,228, 0.5)"}} onClick={() => {changeMapType("macaron")}}>马卡龙</div>
                    <div style={{background: "rgba(63,197,199, 0.5)"}} onClick={() => {changeMapType("graffiti")}}>涂鸦</div>
                    <div style={{background: "rgba(204,215,215, 0.5)"}} onClick={() => {changeMapType("whitesmoke")}}>远山黛</div>
                    <div style={{background: "rgba(22,22,24, 0.5)"}} onClick={() => {changeMapType("dark")}}>幻影黑</div>
                    <div style={{background: "rgba(144,204,204, 0.5)"}} onClick={() => {changeMapType("fresh")}}>草色青</div>
                    <div style={{background: "rgba(7,24,55, 0.5)"}} onClick={() => {changeMapType("darkblue")}}>极夜蓝</div>
                    <div style={{background: "rgba(8,42,58, 0.5)"}} onClick={() => {changeMapType("blue")}}>靛青蓝</div>
                    <div style={{background: "rgba(200,200,200, 0.5)"}} onClick={() => {changeMapType("light")}}>月光银</div>
                    <div style={{background: "rgba(27,35,44, 0.5)"}} onClick={() => {changeMapType("grey")}}>雅土灰</div>
                </div>
                <div className="-features-box">
                    <div className="road" onClick={() => {changeMapFeatures("reset")}}>复原</div>
                    <div className="road" onClick={() => {changeMapFeatures("road")}}>道路及道路标注</div>
                    <div className="point" onClick={() => {changeMapFeatures("point")}}>兴趣点</div>
                    <div className="bg" onClick={() => {changeMapFeatures("bg")}}>区域面</div>
                    <div className="building" onClick={() => {changeMapFeatures("building")}}>建筑物</div>
                </div>
            </div>
            <InsertDataModal ref={inserDataModalRef}/>
        </div>
    )
}
// export default withRouter(MainPage);

export default connect(
    state => ({
        mapState: state.mapState,
    }), {
        initAmap: initAmapAction,
})(withRouter(MainPage));