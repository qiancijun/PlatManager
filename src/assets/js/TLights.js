import { AmbientLight, PointLight, SpotLight } from "three";

export const lightsList = [];

// 设置光源
const ambientLight = new AmbientLight(0xffffff, 0.5);
// 设置点光
export const pointLight = new PointLight(
    'rgb(255, 255, 255)',
    0.7,
    200,
    0.1
);

export const spotLight = new SpotLight(
    'rgb(255, 255, 255)',
    1,
    200,
    Math.PI / 180 * 45,
    0,
    0
);

spotLight.castShadow = true;
spotLight.position.set(-50, 50, -50);
pointLight.position.set(0, 30, 0);

lightsList.push(ambientLight, pointLight);
// lightsList.push(spotLight);