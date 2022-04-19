import { Mesh, MOUSE, PerspectiveCamera, Raycaster, Scene, Vector2, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera.js';
import Stats from 'three/examples/jsm/libs/stats.module'

export class TEngine {
    constructor(dom, handler, renderDiv) {
        this.handler = handler;
        this.renderDiv = renderDiv;
        this.dom = dom;
        this.renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        this.scene = new Scene();
        // this.camera     = new PerspectiveCamera(45, dom.offsetWidth / dom.offsetHeight, 1, 1000);
        this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        this.mouse = new Vector2();
        this.raycaster = new Raycaster();

        // 设置相机视角
        this.camera.position.set(20, 20, 10);
        this.camera.lookAt(new Vector3(0, 0, 0));
        this.camera.up = new Vector3(0, 1, 0);

        this.renderer.shadowMap.enabled = true; // 开启阴影效果
        this.renderer.setSize(dom.offsetWidth, dom.offsetHeight, true);

        this.dom.addEventListener('mousemove', this.onMouseMove, false);

        // 初始化性能监视器
        const stats = Stats();
        const statsDom = stats.domElement;
        statsDom.style.position = "fixed";
        statsDom.style.top = '44px';
        statsDom.style.right = '0';

        // 初始化轨道控制器 orbitControls
        const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        // orbitControls.autoRotate    = true;
        orbitControls.enableDamping = true;
        orbitControls.mouseButtons = {
            LEFT: null,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.ROTATE
        }

        const renderFun = () => {

            // 通过摄像机和鼠标位置更新射线
            this.raycaster.setFromCamera(this.mouse, this.camera);
            // 计算物体和射线的焦点
            // const intersects = this.raycaster.intersectObjects(this.scene.children);

            // for (let i = 0; i < intersects.length; i++) {
            //     this.handler(intersects[i].object)
            // }

            orbitControls.update();
            if (this.renderer != null) {
                this.renderer.render(this.scene, this.camera);
            }
            stats.update();
            requestAnimationFrame(renderFun);
        }
        renderFun();
        this.dom.appendChild(this.renderer.domElement);
        this.dom.appendChild(statsDom);
        window.addEventListener('click', this.onMouseClick, false);
    }

    clean = () => {
        console.log("clean")
        this.scene.traverse(
            child => {
                console.log(child);
            }
        );
        this.render.dispose();
        this.scene.clear();
    }

    onMouseClick = (e) => {
        const objs = new Set();
        // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        // 获取raycaster直线和所有模型相交的数组集合
        var intersects = this.raycaster.intersectObjects(this.scene.children, true);
        for (var i = 0; i < intersects.length; i++) {
            const obj = intersects[i].object;
            objs.add(obj);
        }
        objs.forEach(obj => {
            // console.log(obj);
            const data = this.handler(obj);
            // console.log(data)
            if (data != null) {
                const pos = {
                    x: e.clientX,
                    y: e.clientY,
                }
                // this.renderDiv(obj.position.clone().project(this.camera), data);
                this.renderDiv(pos, data);
            }
            // console.log(obj.position.clone().project(this.camera));
        });
        objs.clear();
    }

    onMouseMove = (event) => {
        // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }

    addObject = (...object) => {
        object.forEach(elem => {
            this.scene.add(elem);
        });
    }
}