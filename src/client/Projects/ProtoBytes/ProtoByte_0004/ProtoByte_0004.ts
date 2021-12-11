// ProtoByte_0004
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import * as path from "path";
import * as THREE from "three";
import { BufferGeometry, CatmullRomCurve3, DoubleSide, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial, RepeatWrapping, SkeletonHelper, SkinnedMesh, TextureLoader, TubeGeometry, Vector3 } from "three";
import { AnchorPoint, cos, FuncType, sin, TWO_PI } from "../../../PByte3/IJGUtils";
import { ProtoTubeBase } from "../../../PByte3/ProtoTubeBase";
import { ProtoTubeGeometry } from "../../../PByte3/ProtoTubeGeometry";
import { VerletStrand } from "../../../PByte3/VerletStrand";

export class ProtoByte_0004 extends ProtoTubeBase {

    skinMesh: SkinnedMesh | undefined;
    skinMesh2: SkinnedMesh | undefined;

    vascularMesh: Mesh | undefined;
    vascularSkinnedMesh: SkinnedMesh | undefined;

    // for bottom verlet Strands
    radialSegs: number = 20;
    strands: VerletStrand[] = [];


    constructor(dim: Vector3 = new Vector3(.2, 1., .2)) {
        super(dim);
        this.create();
    }

    create() {
        // Begin organ
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


        const texture = new TextureLoader().load("textures/corroded_red.jpg");
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(3, 1);

        this.boneCount = 5;
        const spineGeom = new ProtoTubeGeometry(path, tubeSegs / 10, this.radialSegs, false, { func: FuncType.SINUSOIDAL_INVERSE, min: 30, max: 80, periods: 3 }, this.boneCount);
        this.curveLenth = spineGeom.pathLen;
        this.curveLengths = spineGeom.pathSegmentLengths;

        const spineMat = new MeshPhongMaterial({ color: 0xFF7777, wireframe: false, side: DoubleSide, map: texture, transparent: true, opacity: 1, bumpMap: texture, bumpScale: 1, shininess: .1 });

        this.boneCount = spineGeom.boneCount;
        this.curveLenth = spineGeom.pathLen;
        this.curveLengths = spineGeom.pathSegmentLengths;


        this.spineMesh = new Mesh(spineGeom, spineMat);
        this.skinMesh = this.makeSkinned(this.spineMesh, this.boneCount, this.curveLenth);
        this.add(this.skinMesh);

        // End Organ

        // Begin vascularity
        this.createVascularity();
        // End vascularity


        // const skelHelper = new SkeletonHelper(this.skinMesh);
        // this.add(skelHelper);

        for (let i = 0; i < this.radialSegs; i++) {
            //skin.geometry.attributes.position.
            let vecs = this.skinMesh.geometry.attributes.position;
            let head = new Vector3(vecs.getX(vecs.count - 1 - this.radialSegs + i), vecs.getY(vecs.count - 1 - this.radialSegs + i), vecs.getZ(vecs.count - 1 - this.radialSegs + i));
            let tail = new Vector3(vecs.getX(vecs.count - 1 - this.radialSegs + i), vecs.getY(vecs.count - 1 - this.radialSegs + i) * -.125, vecs.getZ(vecs.count - 1 - this.radialSegs + i));

            this.strands[i] = new VerletStrand(head, tail, 10, AnchorPoint.HEAD);
            this.add(this.strands[i]);
        }
    }

    createVascularity() {
        let u = 0;
        let x, y, z, x2, y2, z2;
        let ptCount = 50;
        let step = TWO_PI / ptCount;
        let vecs: Vector3[] = [];
        let vecs2: Vector3[] = [];
        let vecsAll: Vector3[] = [];

        for (let i = 0; i < ptCount; i++) {

            x = -22 * cos(u) - 128 * sin(u) - 44 * cos(3 * u) - 78 * sin(3 * u);
            y = -10 * cos(2 * u) - 27 * sin(2 * u) + 38 * cos(4 * u) + 46 * sin(4 * u);
            z = 70 * cos(3 * u) - 40 * sin(3 * u);

            vecs[i] = new Vector3(x, y, z);
            vecsAll.push(vecs[i]);
            u += step;
        }
        for (let i = 0; i < ptCount; i++) {
            x2 = 41 * cos(u) - 18 * sin(u) - 83 * cos(2 * u) - 83 * sin(2 * u) - 11 * cos(3 * u) + 27 * sin(3 * u);
            y2 = 36 * cos(u) + 27 * sin(u) - 113 * cos(2 * u) + 30 * sin(2 * u) + 11 * cos(3 * u) - 27 * sin(3 * u);
            z2 = 45 * sin(u) - 30 * cos(2 * u) + 113 * sin(2 * u) - 11 * cos(3 * u) + 27 * sin(3 * u);

            vecs2[i] = new Vector3(x2, y2, z2);
            vecsAll.push(vecs2[i]);
            u += step;
        }

        let curve1 = new CatmullRomCurve3(vecs, true);
        let curve2 = new CatmullRomCurve3(vecs2, true);
        let curveAll = new CatmullRomCurve3(vecsAll, true);

        const pts1 = curve1.getPoints(150);
        const pts2 = curve2.getPoints(150);
        const ptsAll = curveAll.getPoints(150);
        const geom1 = new BufferGeometry().setFromPoints(pts1);
        const geom2 = new BufferGeometry().setFromPoints(pts2);
        const geomAll = new BufferGeometry().setFromPoints(ptsAll);

        const material = new LineBasicMaterial({ color: 0x22FF33 });

        // Create the final object to add to the scene
        const curveObject1 = new Line(geom1, material);
        const curveObject2 = new Line(geom2, material);

        // this.add(curveObject1);
        // this.add(curveObject2);

        const tubeGeom = new TubeGeometry(curve1, 150, 1, 12, true);
        const tubeMat = new MeshPhongMaterial({ color: 0xAA2222 });
        // this.add(new Mesh(tubeGeom, tubeMat));

        const tubeGeom2 = new ProtoTubeGeometry(curve2, 250, 12, true, { func: FuncType.SINUSOIDAL_RANDOM, min: 2, max: 5, periods: 80 });
        const tubeMat2 = new MeshPhongMaterial({ color: 0x334422 });
        let tubeMesh2 = new Mesh(tubeGeom2, tubeMat2);
        //this.add(tubeMesh2);

        // let curveLenth2 = tubeGeom2.pathLen;
        // let curveLengths2 = tubeGeom2.pathSegmentLengths;


        // this.skinMesh2 = this.makeSkinned(tubeMesh2, 30, curveLenth2);
        // this.add(this.skinMesh2);

        let verts = this.skinMesh!.geometry.attributes.position;
        let vecs3: Vector3[] = [];
        for (let i = 0; i < verts.count; i++) {
            if (i % 18 == 0) {
                vecs3.push(new Vector3(verts.getX(i), verts.getY(i), verts.getZ(i)));
            }
        }
        //const curveObject3 = new Line(geom2, material);
        let curve3 = new CatmullRomCurve3(vecs3, false);
        //const tubeGeom3 = new TubeGeometry(curve3, 3550, 1, 12, false);
        const tubeGeom3 = new ProtoTubeGeometry(curve3, 350, 12, false, { func: FuncType.SINUSOIDAL, min: 2, max: 5, periods: 3 });
        const tubeMat3 = new MeshPhongMaterial({ color: 0x771111, transparent: true, opacity: .95 });
        this.vascularMesh = new Mesh(tubeGeom3, tubeMat3);
        this.vascularSkinnedMesh = this.makeSkinned(this.vascularMesh, 5, this.curveLenth!);
        this.add(this.vascularSkinnedMesh);

    }


    move(time: number) {
        const time2 = sin(time * .2) - cos(time * .1);

        if (this.skinMesh) {
            this.skinMesh.skeleton.bones[2].rotation.y = Math.cos(time2) * 5 / this.skinMesh.skeleton.bones.length;
            this.skinMesh.skeleton.bones[3].rotation.z = Math.sin(time2) * 8 / this.skinMesh.skeleton.bones.length;
            this.skinMesh.skeleton.bones[1].rotation.x = Math.sin(time2) * 2 / this.skinMesh.skeleton.bones.length;
            this.skinMesh.skeleton.bones[0].rotation.y = Math.sin(time2) * 2 / this.skinMesh.skeleton.bones.length;


            // vascularity along form
            this.vascularSkinnedMesh!.skeleton.bones[2].rotation.y = Math.cos(time2) * 5 / this.skinMesh.skeleton.bones.length;
            this.vascularSkinnedMesh!.skeleton.bones[3].rotation.z = Math.sin(time2) * 8 / this.skinMesh.skeleton.bones.length;
            this.vascularSkinnedMesh!.skeleton.bones[1].rotation.x = Math.sin(time2) * 2 / this.skinMesh.skeleton.bones.length;
            this.vascularSkinnedMesh!.skeleton.bones[0].rotation.y = Math.sin(time2) * 2 / this.skinMesh.skeleton.bones.length;

        }
        // let vecs = this.skinMesh!.geometry.attributes.position;
        // console.log(vecs.getX(vecs.count - 1 - this.radialSegs + 0));
        // for (let i = 0; i < this.strands.length; i++) {
        //     this.strands[i].setHeadPosition(new Vector3(vecs.getX(vecs.count - 1 - this.radialSegs + i), vecs.getY(vecs.count - 1 - this.radialSegs + i), vecs.getZ(vecs.count - 1 - this.radialSegs + i)));

        //     this.strands[i].verlet();
        // }
    }
}


