import { trace } from "console";
import * as THREE from "three";
import { Bone, CatmullRomCurve3, Curve, DoubleSide, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, Skeleton, SkeletonHelper, SkinnedMesh, TubeBufferGeometry, TubeGeometry, Uint16BufferAttribute, Vector3 } from "three";
import { FuncType, PBMath } from "../../PByte3/IJGUtils";
import { ProtoTubeGeometry } from "../../PByte3/ProtoTubeGeometry";

export class ProtoByte_0000 extends Group {
    dim: Vector3;

    constructor(dim: Vector3 = new Vector3(.2, 1., .2)) {
        super();
        this.dim = dim;

        const tubeSegs = 400;
        const pathVecs: Vector3[] = [];
        let theta = 0;
        let phi = 0;

        let step = dim.y / tubeSegs;
        for (let i = 0; i < tubeSegs; i++) {
            let x = Math.sin(theta) * this.dim.x;
            let y = dim.y / 2 - step * i;
            let z = Math.cos(theta) * this.dim.z;
            pathVecs[i] = new Vector3(x, y, z);
            theta += Math.PI / 180;
        }
        const path = new CatmullRomCurve3(pathVecs);

        const texture = new THREE.TextureLoader().load("textures/corroded_red.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 1);

        const spineGeom = new ProtoTubeGeometry(path, tubeSegs / 10, 20, false, { func: FuncType.SINUSOIDAL_INVERSE, min: 30, max: 80, periods: 3 });
        const spineMat = new MeshPhongMaterial({ color: 0xFF7700, wireframe: false, side: DoubleSide, map: texture, transparent: true, opacity: 1, bumpMap: texture, bumpScale: 1, shininess: .8 });
        const spineMesh = new Mesh(spineGeom, spineMat);
        this.add(spineMesh);

    }
}