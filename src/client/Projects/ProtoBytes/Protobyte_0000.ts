import { trace } from "console";
import * as THREE from "three";
import { Bone, CatmullRomCurve3, Curve, DoubleSide, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, Skeleton, SkeletonHelper, SkinnedMesh, TubeBufferGeometry, TubeGeometry, Uint16BufferAttribute, Vector3 } from "three";
import { FuncType, PBMath } from "../../PByte3/IJGUtils";
import { ProtoTubeGeometry } from "../../PByte3/ProtoTubeGeometry";

export class ProtoByte_0000 extends Group {
    dim: Vector3;
    spineMesh: Mesh;
    pathVecs: Vector3[] = [];

    // temporary solution, needs to be put in a base calss eventually
    boneCount: number;
    curveLenth: number
    curveLengths: number[] = [];

    constructor(dim: Vector3 = new Vector3(.2, 1., .2)) {
        super();
        this.dim = dim;

        const tubeSegs = 400;
        // const pathVecs: Vector3[] = [];
        let theta = 0;
        let phi = 0;

        let step = dim.y / tubeSegs;
        for (let i = 0; i < tubeSegs; i++) {
            // y-axis
            let x = Math.sin(theta) * this.dim.x;
            let y = dim.y / 2 - step * i;
            let z = Math.cos(theta) * this.dim.z;

            // x-axis
            // let x = dim.x / 2 - step * i;
            // let y = Math.sin(theta) * this.dim.y;
            // let z = Math.cos(theta) * this.dim.z;

            //z-axis
            // let x = Math.cos(theta) * this.dim.x;
            // let y = Math.sin(theta) * this.dim.y;
            // let z = dim.z / 2 - step * i;




            this.pathVecs[i] = new Vector3(x, y, z);
            theta += Math.PI / 180;
        }

        // for (let i = 0; i < tubeSegs; i++) {
        //     let x = 0;
        //     let y = dim.y / 2 - step * i;
        //     let z = 0;
        //     this.pathVecs[i] = new Vector3(x, y, z);
        //     theta += Math.PI / 180;
        // }
        const path = new CatmullRomCurve3(this.pathVecs);


        const texture = new THREE.TextureLoader().load("textures/corroded_red.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 1);

        const spineGeom = new ProtoTubeGeometry(path, tubeSegs / 10, 20, false, { func: FuncType.SINUSOIDAL_INVERSE, min: 30, max: 80, periods: 3 });
        const spineMat = new MeshPhongMaterial({ color: 0xFF7700, wireframe: false, side: DoubleSide, map: texture, transparent: true, opacity: 1, bumpMap: texture, bumpScale: 1, shininess: .8 });

        // TO DO: eventually move to base ProtoByte class
        this.boneCount = spineGeom.boneCount;
        this.curveLenth = spineGeom.pathLen;
        this.curveLengths = spineGeom.pathSegmentLengths;


        this.spineMesh = new Mesh(spineGeom, spineMat);
        this.add(this.spineMesh);

    }
}


