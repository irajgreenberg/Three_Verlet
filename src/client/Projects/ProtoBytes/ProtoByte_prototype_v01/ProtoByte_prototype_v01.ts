// ProtoByte_prototype_v01
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import {
    CatmullRomCurve3,
    DoubleSide,
    Mesh,
    MeshPhongMaterial,
    RepeatWrapping,
    TextureLoader,
    Vector3,
    BufferAttribute,
    Color,
    Box3Helper,
} from "three";
import { randFloat, randInt } from "three/src/math/MathUtils";
import { AnchorPoint, cos, FuncType, PI, sin } from "../../../PByte3/IJGUtils";
import { ProtoTubeBase } from "../../../PByte3/ProtoTubeBase";
import { ProtoTubeGeometry } from "../../../PByte3/ProtoTubeGeometry";
import { VerletAnnulusGeometry2 } from "../../../PByte3/VerletAnnulusGeometry2";
import { VerletStrand } from "../../../PByte3/VerletStrand";
import { Box3 } from 'three';

// some convenience vars
let theta = 0;
let phi = 0;
let freq = PI / 90;
let freq2 = PI / 180;
let amp = 20.4;

//for testing serpentine motion of mesh
let thetas: number[] = [];
// let thetasArr = [];
let tailTheta = 0;
let headTheta = 0;

export class ProtoByte_prototype_v01 extends ProtoTubeBase {

    annuliGeoms: VerletAnnulusGeometry2[] = [];
    annuliMeshs: Mesh[] = [];

    tubeGeom: ProtoTubeGeometry | undefined;
    bufferClone: BufferAttribute | undefined;

    hairs: VerletStrand[] = [];

    boundingBox: Box3 | undefined;
    boundingBoxHelper: Box3Helper | undefined;

    constructor(dim: Vector3 = new Vector3(0.2, 1, 0.2)) {
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


            this.pathVecs[i] = new Vector3(x, y, z);
            theta += Math.PI / 180;

            // for slithering
            thetas[i] = Math.PI / 180 * i * 30;
        }

        const path = new CatmullRomCurve3(this.pathVecs);

        const texture = new TextureLoader().load("textures/humanSkin02.jpg");
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(3, 1);

        const textureAnnulus = new TextureLoader().load("textures/leather2.jpg");
        textureAnnulus.wrapS = RepeatWrapping;
        textureAnnulus.wrapT = RepeatWrapping;
        textureAnnulus.repeat.set(3, 3);


        let tubeSections = 18;
        let radialSections = 36;
        this.tubeGeom = new ProtoTubeGeometry(path, tubeSections, radialSections, false, { func: FuncType.SINUSOIDAL, min: 5, max: 50, periods: 1 }, this.boneCount);

        this.curveLenth = this.tubeGeom.pathLen;
        this.curveLengths = this.tubeGeom.pathSegmentLengths;

        const tubeMat = new MeshPhongMaterial({
            color: 0xffaaff,
            wireframe: false,
            side: DoubleSide,
            map: texture,
            transparent: true,
            opacity: 1,
        /* bumpMap: texture, */ bumpScale: 1,
            shininess: 0.1,
        });

        this.curveLenth = this.tubeGeom.pathLen;
        this.curveLengths = this.tubeGeom.pathSegmentLengths;

        this.tubeMesh = new Mesh(this.tubeGeom, tubeMat);
        this.tubeMesh.castShadow = true;
        this.add(this.tubeMesh);

        this.boundingBox = new Box3().setFromObject(this.tubeMesh);
        this.boundingBoxHelper = new Box3Helper(this.boundingBox, new Color(0xFFFFFF));
        // this.add(this.boundingBoxHelper);

        this.bufferClone = this.tubeMesh.geometry.attributes.position.clone();

        const annuliMats = [];
        for (let i = 0; i <= this.tubeGeom!.tubularSegments; i++) {
            annuliMats[i] = new MeshPhongMaterial({
                color: randInt(0xff1100, 0xff8800),
                wireframe: false,
                side: DoubleSide,
                map: textureAnnulus,
                transparent: true,
                opacity: randFloat(.3, .7),
            /* bumpMap: texture, */ bumpScale: 1,
                shininess: 0.9,
            });
        }


        const annulusMat = new MeshPhongMaterial({
            color: 0xFF7777,
            wireframe: false,
            side: DoubleSide,
            map: textureAnnulus,
            transparent: true,
            opacity: .4,
        /* bumpMap: texture, */ bumpScale: 1,
            shininess: 0.6,
        });
        let radialCount = this.tubeGeom.radialSegments;
        let radiuSteps = PI / this.tubeGeom!.tubularSegments;
        for (let i = 0; i <= this.tubeGeom!.tubularSegments; i++) {
            let r = 30 + Math.abs(sin(radiuSteps * i) * 50);
            this.annuliGeoms[i] = new VerletAnnulusGeometry2(30, r, radialCount, 3, 0);
            this.annuliMeshs[i] = new Mesh(this.annuliGeoms[i], annuliMats[i]);
            this.add(this.annuliMeshs[i]);
        }
        for (let i = 0; i <= radialCount; i++) {
            this.hairs[i] = new VerletStrand(new Vector3(0, 0, 0), new Vector3(25 + randFloat(-14, 14), 25 + randFloat(-14, 14), 25 + randFloat(-14, 14)), Math.floor(randFloat(5, 10)), AnchorPoint.HEAD, randFloat(.08, .3));
            this.add(this.hairs[i]);
            this.hairs[i].setStrandColor(new Color(randFloat(0xFF6600, 0xFF0000)));
            this.hairs[i].setStrandOpacity(.3);
        }
    }

    move(time: number) {
        for (let i = 0; i <= this.tubeGeom!.tubularSegments; i++) {

            if (this.annuliGeoms[i] && this.annuliMeshs[i]) {
                this.annuliGeoms[i].verlet();

                let pos = this.annuliMeshs[i].geometry.attributes.position;
                pos.needsUpdate = true;

                for (let j = 0; j < pos.count; j++) {
                    let x = this.annuliGeoms[i].nodes2[j].position.x;
                    let y = this.annuliGeoms[i].nodes2[j].position.y;
                    let z = this.annuliGeoms[i].nodes2[j].position.z;
                    pos.setXYZ(j, x, y, z);
                }
            }
        }

        let tubeMeshPosition = this.tubeMesh!.geometry.attributes.position;
        tubeMeshPosition.needsUpdate = true;

        for (let i = 0, k = 0; i < this.tubeGeom!.tubularSegments + 1; i++) {
            for (let j = 0; j < this.tubeGeom!.radialSegments; j++) {
                k = i * (this.tubeGeom!.radialSegments + 1) + j;
                this.annuliGeoms[i]!.headNodes[j].position.x = tubeMeshPosition.getX(k) * .95; i
                this.annuliGeoms[i]!.headNodes[j].position.y = tubeMeshPosition.getY(k) * .95; i
                this.annuliGeoms[i]!.headNodes[j].position.z = tubeMeshPosition.getZ(k) * .95;

            }
        }


        for (let i = 0; i <= this.tubeGeom!.tubularSegments; i++) {
            for (let j = 0, k = 0; j <= this.tubeGeom!.radialSegments; j++) {
                k = i * (this.tubeGeom!.radialSegments + 1) + j;

                // snake
                let x = this.bufferClone!.getX(k) + sin(thetas[i]) * amp
                let y = this.bufferClone!.getY(k) + cos(thetas[i]) * amp;// + pos.getY(i);
                let z = this.bufferClone!.getZ(k);// + pos.getZ(i);


                tubeMeshPosition.setXYZ(k, x, y, z);

            }
            thetas[i] += freq;
        }

        let tail = new Vector3(0, 0, 0);
        for (let j = 0; j <= this.tubeGeom!.radialSegments; j++) {
            let x = this.bufferClone!.getX(j)
            let y = this.bufferClone!.getY(j)
            let z = this.bufferClone!.getZ(j)
            if (j == 0) {
                tail = new Vector3(x, y, z);
            } else {
                tail.add(new Vector3(x, y, z));
            }
        }
        // tail.divideScalar(Math.max(1, this.tubeGeom!.radialSegments - Math.abs(sin(tailTheta * PI / 180) * 0)));

        tail.divideScalar(this.tubeGeom!.radialSegments + 1);
        tailTheta += 3.2;

        for (let j = 0; j <= this.tubeGeom!.radialSegments; j++) {
            let temp = new Vector3();
            temp.x = tubeMeshPosition.getX(j) - tail.x;
            temp.y = tubeMeshPosition.getY(j) - tail.y;
            temp.z = tubeMeshPosition.getZ(j) - tail.z;
            temp.normalize();
            // tubeMeshPosition.setXYZ(j, temp.x, temp.y, temp.z);
            let x = tubeMeshPosition.getX(j) + temp.x * Math.abs(sin(time * PI / 490) * 5);
            let y = tubeMeshPosition.getY(j) + temp.y * Math.abs(sin(time * PI / 490) * 30);
            let z = tubeMeshPosition.getZ(j) + temp.z * Math.abs(sin(time * PI / 490) * 5);
            tubeMeshPosition.setXYZ(j, x, y, z);
            this.hairs[j].setHeadPosition(new Vector3(x, y, z));
            if (j > 0) {
                this.hairs[j].verlet();
            }
        }

        // mouth opening/closing

        //for (let i = 0, k = 0; i < this.tubeGeom!.tubularSegments + 1; i++) {
        //   for (let j = 0; j < this.tubeGeom!.radialSegments; j++) {
        let head = new Vector3(0, 0, 0);
        for (let j = 0, k = 0; j <= this.tubeGeom!.radialSegments; j++) {
            k = (this.tubeGeom!.tubularSegments) * (this.tubeGeom!.radialSegments + 1) + j;
            let x = this.bufferClone!.getX(k)
            let y = this.bufferClone!.getY(k)
            let z = this.bufferClone!.getZ(k)
            if (k == 0) {
                head = new Vector3(x, y, z);
            } else {
                head.add(new Vector3(x, y, z));
            }
        }
        // head.divideScalar(Math.max(1, this.tubeGeom!.radialSegments - Math.abs(sin(headTheta * PI / 180) * 0)));

        head.divideScalar(this.tubeGeom!.radialSegments + 1);
        headTheta += 3.2;

        for (let j = 0, k = 0; j <= this.tubeGeom!.radialSegments; j++) {
            k = (this.tubeGeom!.tubularSegments) * (this.tubeGeom!.radialSegments + 1) + j;
            let temp = new Vector3();
            temp.x = tubeMeshPosition.getX(k) - head.x;
            temp.y = tubeMeshPosition.getY(k) - head.y;
            temp.z = tubeMeshPosition.getZ(k) - head.z;
            temp.normalize();
            // tubeMeshPosition.setXYZ(k, temp.x, temp.y, temp.z);
            let x = tubeMeshPosition.getX(k) + temp.x * sin(time * PI / 190) * 10;
            let y = tubeMeshPosition.getY(k) + temp.y * sin(time * PI / 190) * 8;
            let z = tubeMeshPosition.getZ(k) + temp.z * sin(time * PI / 190) * 10;
            tubeMeshPosition.setXYZ(k, x, y, z);
            // this.hairs[k].setHeadPosition(new Vector3(x, y, z));
            // if (k > 0) {
            //     this.hairs[k].verlet();
            // }
        }


    }

}
