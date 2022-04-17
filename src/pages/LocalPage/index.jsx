// 3D 地图环视页面
import { message } from 'antd';
import React, { Component } from 'react';
// redux 相关
import { connect } from 'react-redux';
// scss
import "./index.scss";

class LocalPage extends Component {
    constructor() {
        super();
        this.map = null;
        this.AMap = null;
        this.lc = null;
        this.pl = null;
        this.marker = null;
        this.geoCoder = null;
    }

    state = {
        center: null,
    }

    componentDidMount() {
        const { marker } = this.props.location.query;
        if (marker == null || undefined) {
            message.error("出现了一点错误，请返回首页");
        } else {
            this.marker = marker;
            this.createMap();
        }
    }

    createMap = () => {
        const { AMap, Loca } = this.props.mapState;
        const extData = this.marker.getExtData();
        const { pos, polygon } = extData;
        if (polygon == null) {
            message.error("没有绘制区块");
            return;
        }
        const path = polygon.getPath();
        const poly = new AMap.Polygon({
            path,
            zIndex: 20,
            strokeColor: "#FFFFFF",
            fillColor: "#FFD700",
        });
        const buildingLayer = new AMap.Buildings({
            zIndex: 130,
            merge: false,
            sort: false,
            zooms: [17, 20],
        });
        // 获取坐标
        let points = [];
        path.map(pos => {
            points.push([pos.lng, pos.lat]);
        });
        const options = {
            hideWithoutStyle: true, // 是否隐藏设定区域外的楼块
            areas: [
                {
                    rejectTexture: true, // 是否屏蔽自定义地图的纹理
                    color1: 'ffffff00',  // 楼顶颜色
                    color2: 'ffffcc00',  // 楼面颜色
                    path: points,
                }
            ]
        };
        buildingLayer.setStyle(options);
        // console.log(options);

        this.map = new AMap.Map('container', {
            zoom: 18,
            viewMode: '3D',
            zooms: [2, 25],
            // layers: [
            //     buildingLayer,
            // ]
            // mapStyle: 'amap://styles/45311ae996a8bea0da10ad5151f72979',
            // showBuildingBlock: false,
            // showLabel: false,
        });
        const map = this.map;
        map.setCenter(pos);
        map.add(poly);
        map.addLayer(buildingLayer);
        // 地图插件
        map.plugin(["AMap.ToolBar"], () => {
            const toolBar = new AMap.ToolBar({
                position: "RB",
                rule: false,
                locate: true
            });
            map.addControl(toolBar);
        });

        map.setMapStyle('amap://styles/dark');
        // Loca
        const lc = new Loca.Container({
            map,
        });
        lc.ambLight = {
            intensity: 2.2,
            color: '#babedc',
        };
        lc.dirLight = {
            intensity: 0.46,
            color: '#d4d4d4',
            target: [0, 0, 0],
            position: [0, -1, 1],
        };
        this.lc = lc;
        let pl = new Loca.PolygonLayer({
            zIndex: 120,
            shininess: 10,
            hasSide: true,
            cullface: 'back',
            depth: true,
        });
        this.pl = pl;
        // 光源
        // const dat = new Loca.Dat();
        // dat.addLight(lc.ambLight, lc, "环境光");
        // dat.addLight(lc.dirLight, lc, "平行光");
        // dat.addLayer(pl, "楼快");

        // 添加点击建筑物出现地址
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
        AMap.Event.addListener(poly, 'click', (data) => {
            const clickPoint = data.lnglat;
            geoCoder.getAddress(clickPoint, (status, data) => {
                // 解码成功
                if (status == "complete") {
                    const baseAddress = data.regeocode.formattedAddress;
                    // 创建 InfoWindow 标记用户地址
                    const infoWindow = new AMap.InfoWindow({
                        autoMove: true,
                        content: baseAddress,
                    });
                    infoWindow.open(map, clickPoint);
                } else {
                    message.warning("地址解析失败")
                }
            });
        });
    }

    render() {
        return (
            <div className="-local-box">
                <div id="container" className="map"></div>
            </div>
        )
    }
}

export default connect(
    state => ({
        mapState: state.mapState,
    }), {}
)(LocalPage);