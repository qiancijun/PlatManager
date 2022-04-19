import { AmbientLight, PointLight, SpotLight } from "three";

export const lightsList = [];

// 设置光源
const ambientLight = new AmbientLight(0xffffff, 0.5);
// 设置点光
export const pointLight = new PointLight(
    'rgb(255, 255, 255)',
    10,
    1000,
    0.1
);

export const spotLight = new SpotLight(
    'rgb(255, 255, 255)',
    10,
    200,
    Math.PI / 180 * 0,
    0,
    0
);

spotLight.castShadow = true;
spotLight.position.set(0, 0, 30);
pointLight.position.set(0, 30, 30);

lightsList.push(ambientLight, pointLight);
lightsList.push(spotLight);