import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

export const LoadModal = (url, callback) => {
    const splits = url.split(".")
    const ext = splits[splits.length-1];
    if (ext == "fbx") {
        const fbxLoader = new FBXLoader();
        fbxLoader.loadAsync(url).then(
            fbx => {
                fbx.traverse(
                    child => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    }
                ); 
                callback(fbx);
            }
        ).catch(err => { console.log(err); });
    } else if (ext == "gltf") {
        const gltfLoader = new GLTFLoader();
        gltfLoader.loadAsync(url).then(
            gltf => {
                callback(gltf.scene);
            }
        ).catch(
            err => {
                console.log(err);
            }
        );
    }
}