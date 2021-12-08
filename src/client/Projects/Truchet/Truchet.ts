// Truchet
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { CatmullRomCurve3, DoubleSide, InstancedMesh, Matrix4, Mesh, MeshPhongMaterial, RepeatWrapping, SkeletonHelper, SkinnedMesh, TextureLoader, Vector3 } from "three";
import { FuncType, HALF_PI, PI } from "../../PByte3/IJGUtils";
import { ProtoTubeBase } from "../../PByte3/ProtoTubeBase";
import { ProtoTubeGeometry } from "../../PByte3/ProtoTubeGeometry";

export class Truchet extends ProtoTubeBase {

    skinMesh: SkinnedMesh | undefined;

    constructor(dim: Vector3 = new Vector3(.2, 1., .2)) {
        super(dim);
        this.create();
    }

    create() {
        let theta = 0;
        let phi = 0;
        let tubeSegs = 6;

        let step = HALF_PI / tubeSegs;
        let vecs2 = [];
        let vecs3 = [];
        for (let i = 0; i <= tubeSegs; i++) {
            // Z-axis
            let x = -this.dim.x / 2 + Math.cos(theta) * this.dim.x / 2;
            let y = -this.dim.x / 2 + Math.sin(theta) * this.dim.x / 2;
            let z = 0;

            // X-axis
            let x1 = 0
            let y1 = this.dim.x / 2 + Math.sin(-theta) * this.dim.x / 2;
            let z1 = -this.dim.x / 2 + Math.cos(-theta) * this.dim.x / 2;

            // Y-axis
            let x2 = this.dim.x / 2 + Math.cos(-HALF_PI - theta) * this.dim.x / 2;
            let y2 = 0;
            let z2 = this.dim.x / 2 + Math.sin(-HALF_PI - theta) * this.dim.x / 2;

            this.pathVecs[i] = new Vector3(x, y, z);
            vecs2[i] = new Vector3(x1, y1, z1);
            vecs3[i] = new Vector3(x2, y2, z2);

            theta += step;
        }

        const path1 = new CatmullRomCurve3(this.pathVecs);
        const path2 = new CatmullRomCurve3(vecs2);
        const path3 = new CatmullRomCurve3(vecs3);

        const texture = new TextureLoader().load("textures/organ01.jpg");
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(1, 1);

        this.boneCount = 5;
        const spineGeom2 = new ProtoTubeGeometry(path2, tubeSegs, 12, false, { func: FuncType.SINUSOIDAL, min: 1, max: 2, periods: 1 }, this.boneCount);
        const spineGeom1 = new ProtoTubeGeometry(path1, tubeSegs, 12, false, { func: FuncType.SINUSOIDAL, min: 1, max: 2, periods: 1 }, this.boneCount);
        const spineGeom3 = new ProtoTubeGeometry(path3, tubeSegs, 12, false, { func: FuncType.SINUSOIDAL, min: 1, max: 2, periods: 1 }, this.boneCount);
        // this.curveLenth = spineGeom.pathLen;
        // this.curveLengths = spineGeom.pathSegmentLengths;

        const spineMat = new MeshPhongMaterial({ color: 0xdddddd, wireframe: false, side: DoubleSide, map: texture, transparent: true, opacity: 1, bumpMap: texture, bumpScale: .2, shininess: .3 });

        // this.boneCount = spineGeom.boneCount;
        // this.curveLenth = spineGeom.pathLen;
        // this.curveLengths = spineGeom.pathSegmentLengths;


        this.spineMesh = new Mesh(spineGeom1, spineMat);
        let spineMesh2 = new Mesh(spineGeom2, spineMat);
        let spineMesh3 = new Mesh(spineGeom3, spineMat);
        this.add(this.spineMesh);
        this.add(spineMesh2);
        this.add(spineMesh3);


    }

    move() {

    }
}


