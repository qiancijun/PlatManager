import { Mesh, BoxBufferGeometry, MeshStandardMaterial } from 'three'

// 绘制模型
export const basicObjectList = [];

// 地面
const stage = new Mesh(
    new BoxBufferGeometry(200, 5, 200),
    new MeshStandardMaterial({ color: "rgb(200, 200, 200)" })
);

stage.receiveShadow = true;

// 立方体
const box = new Mesh(
    new BoxBufferGeometry(20, 20, 20),
    new MeshStandardMaterial({ color: "rgb(255, 255, 0)" })
)
box.castShadow = true;
box.position.y = 10;

basicObjectList.push(stage, box);