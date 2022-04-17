import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export const LoadModal = (url, callback) => {
    const loader = new GLTFLoader();
    loader.loadAsync(url).then(
        gltf => {
            callback(gltf);
        }
    ).catch(
        err => {
            console.log(err);
        }
    );
}