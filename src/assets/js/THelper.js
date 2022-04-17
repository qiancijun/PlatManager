import { AxesHelper, GridHelper, PointLightHelper, SpotLightHelper } from "three";
import { pointLight, spotLight } from "./TLights";

export const helpList = [];

// 设置辅助线
const axesHelper = new AxesHelper(500);
const gridHelper = new GridHelper(500, 20, "rgb(200, 200, 200)", "rgb(100, 100, 100)");
// const pointLightHelper = new PointLightHelper(pointLight, pointLight.distance, pointLight.color);
// const spotLightHelper = new SpotLightHelper(spotLight, spotLight.color)

helpList.push(axesHelper, gridHelper);