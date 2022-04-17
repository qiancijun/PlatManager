/**
 * const extData = {
        id: null,
        pos: pos,
        address: addr,
        label: label,
        area: 0,
        polygon: null,
        infoWindow: null,
    }
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withRouter } from 'react-router-dom'
import AMapLoader from '@amap/amap-jsapi-loader';
import './index.scss';
import { Button, message, Tooltip } from 'antd';
import CreatePlatModal from '../Modals/CreatePlatModal';
// redux 相关
import { connect } from 'react-redux'
import { createMapAction, addMarkerAction, deleteMarkerAction, initAmapAction } from '@/redux/actions/map'
// 图标
import me from "@/assets/imgs/svgs/me.svg"
import point from "@/assets/imgs/svgs/point.svg"
import platIcon from "@/assets/imgs/svgs/plat.svg"
import locate from "@/assets/imgs/svgs/locate.svg"
// 接口
import { checkLabel, insertPlat, insertPath, listPlats, deletePlat, deletePath } from '@/interfaces/plat'

class MapComponent extends Component {
    constructor() {
        super();
        this.map = null;
        this.polyEditor = null;
        this.geoCoder = null;
        this.AMap = null;
        this.centerMarker = null;
    }
    state = {
        center: null,
        canCreatePlat: false,
        pointLabel: "", // 通过标点创建 Marker 时的 Label
    }

    createPlatModal = React.createRef();
    pointRef = React.createRef();

    // dom渲染成功后进行map对象的创建
    componentDidMount() {
        this.initMap();
    }

    // 初始化地图组件
    initMap = () => {
        AMapLoader.load({
            key: "7cfb0211123d87732ce8a4c0ecc31f48", // 申请好的Web端开发者Key，首次调用 load 时必填
            version: "2.0",
            Loca: {                // 是否加载 Loca， 缺省不加载
                version: '2.0.0'  // Loca 版本，缺省 1.3.2
            },
        }).then((AMap) => {
            this.props.initAmap({
                AMap,
                Loca,
            });
            this.AMap = this.props.mapState.AMap;
            this.createMap();
            this.createLocate();
            this.getPlat(1);
        }).catch(e => {
            console.log(e);
        })
    }

    createMap = () => {
        const AMap = this.AMap;
        this.map = new AMap.Map("container", { //设置地图容器id
            viewMode: "2D",         //是否为3D地图模式
            zoom: 18,                //初始化地图级别
            zooms: [2, 25],
        });

        const map = this.map;
        map.setMapStyle('amap://styles/normal');
        map.plugin(["AMap.ToolBar",
            "AMap.PlaceSearch",
            "AMap.AutoComplete",
            "AMap.PolygonEditor",
            "AMap.Geolocation",
            "AMap.Geocoder"], () => {
                const toolBar = new AMap.ToolBar({
                    position: "RB",
                    rule: false,
                    locate: true
                });
                map.addControl(toolBar);
                const auto = new AMap.AutoComplete({
                    input: "amapInput"
                });
                const placeSearch = new AMap.PlaceSearch({
                    map: map
                });
                AMap.Event.addListener(auto, 'select', (e) => {
                    placeSearch.setCity(e.poi.adcode);
                    placeSearch.search(e.poi.name);
                })

                // 地理编码与逆地理编码
                const geoCoder = new AMap.Geocoder({
                    // 全取默认值
                    // city: // 城市，地理编码时，设置地址描述所在城市。默认值：“全国”
                    // radius: // 逆地理编码时，以给定坐标为中心点，单位：米，默认 1000
                    // lang: // 设置语言类型，默认中文
                    // batch: // 是否批量查询，默认 false
                    // extensions: // 逆地理编码时，返回信息的详略。默认值：base，返回基本地址信息取值为：all，返回地址信息及附近poi、道路、道路交叉口等信息
                });
                this.geoCoder = geoCoder;

                // 精准定位服务
                const geoLocaltion = new AMap.Geolocation({
                    position: "LB",     // 悬停位置，默认为"RB"，即右下角
                    timeout: 3,         // 定位超时时间
                    convert: true,     // 是否转换为高德坐标
                });

                geoLocaltion.getCurrentPosition((res, data) => {
                    if (res == "complete") {
                        // 定位成功
                        const location = data.position;
                        const center = new AMap.LngLat(location.lng, location.lat);
                        this.setState({ center })
                        map.setCenter(center);
                        const userPos = new AMap.Marker({
                            position: center,
                            // icon: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
                            icon: me,
                            anchor: 'top-center',
                        });
                        this.centerMarker = userPos;
                        // 将用户的坐标解码成具体位置
                        let baseAddress = "";
                        geoCoder.getAddress(center, (status, data) => {
                            if (status == "complete") {
                                // 解码成功
                                baseAddress = data.regeocode.formattedAddress;
                                // 创建 InfoWindow 标记用户地址
                                const infoWindow = new AMap.InfoWindow({
                                    autoMove: true,
                                    content: "您的位置：" + baseAddress,
                                });
                                AMap.Event.addListener(userPos, 'click', () => {
                                    infoWindow.open(map, center);
                                });

                            } else {
                                message.warning('地址解析失败');
                            }
                        })
                        map.add(userPos);
                    } else {
                        // 定位失败
                        message.warning('精准定位失败');
                    }
                });

                // 自定义矢量化图像
                const polyEditor = new AMap.PolygonEditor(map, null, {
                    createOptions: {
                        strokeColor: "#FFFFFF",
                        fillColor: "#FFD700",
                        fillOpacity: 0.7,
                        strokeWeight: 2,
                    }
                });
                this.polyEditor = polyEditor;
                AMap.Event.addListener(polyEditor, 'add', (data) => {
                    let polygon = data.target;
                    polyEditor.addAdsorbPolygons(polygon);
                    AMap.Event.addListener(polygon, 'dblclick', () => {
                        polyEditor.setTarget(polygon);
                        polyEditor.open();
                    });
                })
            })
        // 完成了所有的初始化，把组件全部交给 redux
        const mapState = {
            map: map,
            amap: AMap,
        }
        this.props.initMapState(mapState);
    }

    // 从数据库拿数据
    getPlat = (uid) => {
        const renderMarker = (plat) => {
            const { addPlatCard, addMarker } = this.props; // 创建完 Marker
            const { AMap, map, polyEditor } = this;
            const { address, center, id, label, path, modal_url, data_url, updated_at } = plat;
            const pos = JSON.parse(center);
            const extData = {
                id: id,
                pos,
                address: address,
                label: label,
                area: 0,
                polygon: null,
                infoWindow: null,
                modalUrl: modal_url,
                dataUrl: data_url,
            }
            const marker = new AMap.Marker({
                position: pos,
                icon: platIcon,
                anchor: 'top-center',
            });
            const content = (
                <>
                    <span>{label}: {address}</span>
                    <div>
                        <Tooltip title="一个地点只能拥有一个区块，请勿重复创建，以免覆盖">
                            <Button type="link" onClick={() => this.createPolygon(marker)}>创建</Button>
                        </Tooltip>
                        <Button type="link" style={{ marginLeft: '10px' }} onClick={() => this.endingCreate(marker)}>完成</Button>
                        <Button type="link" style={{ marginLeft: '10px' }} onClick={() => this.deletePolygon(marker)}>清除</Button>
                        <Button type="link" style={{ marginLeft: '10px' }} onClick={() => this.deletePlat(marker)}>删除</Button>
                    </div>
                </>
            );
            const contentDiv = document.createElement(`div`);
            ReactDOM.render(content, contentDiv);
            const infoWindow = new AMap.InfoWindow({
                autoMove: true,
                closeWhenClickMap: false, // 控制是否在鼠标点击地图后关闭信息窗体，默认false，鼠标点击地图后不关闭信息窗体
            });
            infoWindow.setContent(contentDiv);
            extData.infoWindow = infoWindow;

            let poly = null;
            if (path != "") {
                const p = JSON.parse(path);
                poly = new AMap.Polygon({
                    path: p,
                    strokeColor: "#FFFFFF",
                    fillColor: "#FFD700",
                    fillOpacity: 0.7,
                    strokeWeight: 2,
                });
                extData.area = poly.getArea();
                extData.polygon = poly;
                AMap.Event.addListener(poly, 'dblclick', () => {
                    polyEditor.setTarget(poly);
                    polyEditor.open();
                });
            }
            AMap.Event.addListener(marker, 'click', () => {
                infoWindow.open(map, pos);
            });
            AMap.Event.addListener(marker, 'dblclick', () => {
                this.goLocaPage(marker);
            });
            marker.setExtData(extData);
            if (poly != null) {
                map.add(poly);
            }
            map.add(marker);
            addMarker({
                label,
                marker,
            });
            addPlatCard(marker);
        }
        listPlats(uid, (plats) => {
            for (let i in plats) {
                renderMarker(plats[i]);
            }
        });
    }

    // 根据详细地址进行逆编码
    addressMarker = (addr, label) => {
        const AMap = this.AMap;
        const map = this.map;
        this.geoCoder.getLocation(addr, (status, data) => {
            if (status == "complete") {
                // 解码成功
                const location = data.geocodes[0].location;
                const { lat, lng } = location;
                const pos = new AMap.LngLat(lng, lat);
                checkLabel(1, label, () => {
                    this.createMarker(addr, label, pos);
                });
            } else {
                // 解码失败
                message.error("地址无效");
                return;
            }
        });
    }

    // 通过坐标点来创建 Marker
    pointMarker = (label, data) => {
        // 将 data 中的坐标转换为具体地址
        const { geoCoder, AMap, map } = this;
        const { lng, lat } = data.lnglat;
        const pos = new AMap.LngLat(lng, lat);
        geoCoder.getAddress(pos, (status, data) => {
            if (status == "complete") {
                const addr = data.regeocode.formattedAddress;
                checkLabel(1, label, () => {
                    this.createMarker(addr, label, pos);
                });

            } else {
                message.error("地址解析失败");
                return;
            }
        });
    }


    createMarker = (addr, label, pos) => {
        const { AMap, map } = this;
        const { addPlatCard, addMarker } = this.props; // 创建完 Marker
        const extData = {
            id: 0,
            pos: pos,
            address: addr,
            label: label,
            area: 0,
            polygon: null,
            infoWindow: null,
            modalUrl: "",
            dataUrl: "",
        }
        const marker = new AMap.Marker({
            position: pos,
            icon: platIcon,
            // icon: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
            anchor: 'top-center',
        });
        // 创建 InfoWindow 标记用户地址
        const content = (
            <>
                <span>{label}: {addr}</span>
                <div>
                    <Tooltip title="一个地点只能拥有一个区块，请勿重复创建，以免覆盖">
                        <Button type="link" onClick={() => this.createPolygon(marker)}>创建</Button>
                    </Tooltip>
                    <Button type="link" style={{ marginLeft: '10px' }} onClick={() => this.endingCreate(marker)}>完成</Button>
                    <Button type="link" style={{ marginLeft: '10px' }} onClick={() => this.deletePolygon(marker)}>清除</Button>
                    <Button type="link" style={{ marginLeft: '10px' }} onClick={() => this.deletePlat(marker)}>删除</Button>
                </div>
            </>
        );
        // 将 ReactElement 渲染到 DOM 上，再将 DOM 放置 InfoWindow
        // 这样做的目的是：ReactElement => HTMLElement => InfoWindow
        const contentDiv = document.createElement(`div`);
        ReactDOM.render(content, contentDiv);
        const infoWindow = new AMap.InfoWindow({
            autoMove: true,
            closeWhenClickMap: false, // 控制是否在鼠标点击地图后关闭信息窗体，默认false，鼠标点击地图后不关闭信息窗体
        });
        infoWindow.setContent(contentDiv);
        // 将 infoWindow 绑定到 Marker身上
        extData.infoWindow = infoWindow;

        AMap.Event.addListener(marker, 'click', () => {
            infoWindow.open(map, pos);
        });
        AMap.Event.addListener(marker, 'dblclick', () => {
            this.goLocaPage(marker);
        })
        marker.setExtData(extData);
        // 信息全部构造完毕，先进行数据库保存再渲染
        map.setCenter(pos);
        map.add(marker);
        addMarker({
            label,
            marker,
        });
        // addPlatCard(marker);
        insertPlat(marker, 1, id => {
            console.log(id);
            const extData = marker.getExtData();
            extData.id = id;
            marker.setExtData(extData);
            console.log(extData);
            addPlatCard(marker);
        });
    }

    // 跳转 LocaPage
    goLocaPage = (marker) => {
        const extData = marker.getExtData();
        if (extData.polygon == null || undefined) {
            message.error("没有绘制区块");
            return;
        }
        this.props.history.push({
            pathname: '/loca',
            query: {
                marker
            }
        })
    }

    // 单击地图的事件
    createLocate = () => {
        const AMap = this.AMap;
        const map = this.map;
        AMap.Event.addListener(map, "click", e => {
            const { canCreatePlat } = this.state;
            if (canCreatePlat == true) {
                // 打开对话框输入Label
                const modal = this.createPlatModal.current;
                modal.showModal(true, e);
                this.setState({ canCreatePlat: false });
                this.pointRef.current.style.backgroundColor = "";
            }
        });
    }

    createPolygon = (marker) => {
        const extData = marker.getExtData();
        const window = extData.infoWindow;
        const polygon = extData.polygon;
        if (polygon != null) {
            // 已经存在区块，删除之前的区块
            this.map.remove(polygon);
        }
        window.close();
        this.polyEditor.close();
        this.polyEditor.setTarget();
        this.polyEditor.open();
        message.success("单击地图开始编辑");
    }

    endingCreate = (marker) => {
        let extData = marker.getExtData();
        const window = extData.infoWindow;
        const polygon = this.polyEditor.getTarget();
        if (polygon == null) {
            message.error("您还没有创建过区块");
            return;
        }
        // 修改 marker 对应的数据
        extData.polygon = polygon;
        extData.area = polygon.getArea();
        marker.setExtData(extData);
        // 获取 polygon 的坐标
        const location = polygon.getPath();
        let path = [];
        location.map(pos => { path.push([pos.lng, pos.lat]) });
        // 上传数据库
        insertPath(extData.id, path, () => {
            // 回调函数
        });
        this.polyEditor.close();
        window.close();
        message.success("保存成功");
    }


    deletePolygon = (marker) => {
        const extData = marker.getExtData();
        const { polygon, id } = extData;
        if (polygon == null || undefined) {
            message.warning('没有创建区块');
            return;
        }
        deletePath(id, () => {
            this.map.remove(polygon);
            this.polyEditor.close();
        });
        // 从数据库中删除
    }

    createPlat = () => {
        // 打开对话框填写信息
        if (this.map == null || undefined) {
            message.error("地图加载失败");
            return;
        }
        const modal = this.createPlatModal.current;
        modal.showModal(false);
    }

    createPlatWithPoint = () => {
        if (this.map == null || undefined) {
            message.error("地图加载失败");
            return;
        }
        const { canCreatePlat } = this.state;
        if (canCreatePlat) {
            this.setState({ canCreatePlat: false });
            this.pointRef.current.style.backgroundColor = "";
        } else {
            this.setState({ canCreatePlat: true });
            this.pointRef.current.style.backgroundColor = "orange";
        }
    }

    deletePlat = (marker) => {
        // 删除该 marker 里的 polygon
        const extData = marker.getExtData();
        const { id, polygon, infoWindow, label } = extData;
        // 删除数据库中的数据，正确步骤应该先删除数据库
        deletePlat(id, () => {
            if (polygon != null) {
                // 确保改区块有创建过 polygon
                this.map.remove(polygon);
            }
            infoWindow.close();
            infoWindow.destroy();
            this.props.deleteMarker(label);
            this.map.remove(marker);
        });
        // 在回调函数中再删除 map 上数据
    }

    back = () => {
        if (this.map == null || undefined) {
            message.error("地图加载失败");
            return;
        }
        const { center } = this.state;
        if (center != null)
            this.map.setCenter(center);
        else 
            message.warning("定位失败");
    }

    /**
     * 销毁地图代码
     */
    unmountMarker = () => {
        if (this.centerMarker != null) {
            this.centerMarker.remove();
        }
        const { mapState } = this.props;
        // console.log(mapState);
        const { markers } = mapState;
        for (let label in markers) {
            markers[label].remove();
        }
    }

    componentWillUnmount() {
        // this.unmountMarker();
        // if (this.map != null) {
        //     this.map.destroy();
        //     this.map = null;
        // }
    }

    render() {
        /**
         * Create: 创建一个新的区块，此时需要输入具体地址，Label
         * Add: 添加 Polygon 
         * Close: 将新创建的区块保存到数据库
         */
        return (
            <div className="-map-box">
                <div className="-search-bar">
                    <input type="text" id="amapInput" />
                    <Button className="-add-polygon" type="primary" onClick={this.createPlat}>Create</Button>
                    <Button className="-add-polygon" type="primary" shape="circle" onClick={this.back}>
                        <img src={point} alt="" />
                    </Button>
                    <Button className="-add-polygon" type="primary" shape="circle" onClick={this.createPlatWithPoint} ref={this.pointRef}>
                        <img src={locate} alt="" />
                    </Button>
                    {/* <Button className="-add-polygon" type="primary" onClick={this.createPolygon}>Add</Button> */}
                </div>
                <div id="container" className="map"></div>
                <CreatePlatModal ref={this.createPlatModal} addressMarker={this.addressMarker} pointMarker={this.pointMarker} />
            </div>
        );
    }
}

export default connect(
    state => ({
        mapState: state.mapState,
    }), {
    initMapState: createMapAction,
    addMarker: addMarkerAction,
    deleteMarker: deleteMarkerAction,
    initAmap: initAmapAction,
}
)(withRouter(MapComponent));