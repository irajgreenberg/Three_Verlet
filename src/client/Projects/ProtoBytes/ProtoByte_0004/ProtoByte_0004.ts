// ProtoByte_0004
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { CatmullRomCurve3, DoubleSide, Mesh, MeshPhongMaterial, RepeatWrapping, SkeletonHelper, SkinnedMesh, TextureLoader, Vector3 } from "three";
import { FuncType } from "../../../PByte3/IJGUtils";
import { ProtoTubeBase } from "../../../PByte3/ProtoTubeBase";
import { ProtoTubeGeometry } from "../../../PByte3/ProtoTubeGeometry";

export class ProtoByte_0004 extends ProtoTubeBase {

    skinMesh: SkinnedMesh | undefined;

    constructor(dim: Vector3 = new Vector3(.2, 1., .2)) {
        super(dim);
        this.create();
    }

    create() {
        let theta = 0;
        let phi = 0;
        let tubeSegs = 400;

        let step = this.dim.y / tubeSegs;
        for (let i = 0; i < tubeSegs; i++) {
            // y-axis
            let x = Math.sin(theta) * this.dim.x;
            let y = this.dim.y / 2 - step * i;
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

        const path = new CatmullRomCurve3(this.pathVecs);


        const texture = new TextureLoader().load("textures/jellySkin.jpg");
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(3, 1);

        this.boneCount = 5;
        const spineGeom = new ProtoTubeGeometry(path, tubeSegs / 10, 20, false, { func: FuncType.SINUSOIDAL_INVERSE, min: 30, max: 80, periods: 3 }, this.boneCount);
        this.curveLenth = spineGeom.pathLen;
        this.curveLengths = spineGeom.pathSegmentLengths;

        const spineMat = new MeshPhongMaterial({ color: 0xff2222, wireframe: false, side: DoubleSide, map: texture, transparent: true, opacity: 1, bumpMap: texture, bumpScale: 1, shininess: .1 });

        this.boneCount = spineGeom.boneCount;
        this.curveLenth = spineGeom.pathLen;
        this.curveLengths = spineGeom.pathSegmentLengths;


        this.spineMesh = new Mesh(spineGeom, spineMat);
        this.skinMesh = this.makeSkinned(this.spineMesh, this.boneCount, this.curveLenth);
        this.add(this.skinMesh);

        // const skelHelper = new SkeletonHelper(this.skinMesh);
        // this.add(skelHelper);
    }

    move(time: number) {
        if (this.skinMesh) {
            this.skinMesh.skeleton.bones[2].rotation.y = Math.cos(time) * 5 / this.skinMesh.skeleton.bones.length;
            this.skinMesh.skeleton.bones[3].rotation.z = Math.sin(time) * 8 / this.skinMesh.skeleton.bones.length;
            this.skinMesh.skeleton.bones[1].rotation.x = Math.sin(time) * 2 / this.skinMesh.skeleton.bones.length;
            this.skinMesh.skeleton.bones[0].rotation.y = Math.sin(time) * 2 / this.skinMesh.skeleton.bones.length;

        }
    }
}


