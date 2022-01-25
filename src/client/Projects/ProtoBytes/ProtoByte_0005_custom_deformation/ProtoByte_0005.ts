// ProtoByte_0005
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { VerletStrand } from "../../../PByte3/VerletStrand";
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, DoubleSide, Line, LineBasicMaterial, Mesh, MeshPhongMaterial, RepeatWrapping, SkeletonHelper, SkinnedMesh, TextureLoader, Vector3 } from "three";
import { randFloat, randInt } from "three/src/math/MathUtils";
import { AnchorPoint, cos, FuncType, GeometryDetail, PI, sin } from "../../../PByte3/IJGUtils";
import { ProtoTubeBase } from "../../../PByte3/ProtoTubeBase";
import { ProtoTubeGeometry } from "../../../PByte3/ProtoTubeGeometry";

let phi = 0;
let phi2 = 0;

export class ProtoByte_0005 extends ProtoTubeBase {

    skinMesh: SkinnedMesh | undefined;
    spineGeom: ProtoTubeGeometry | undefined;
    radialSegs: number | undefined;
    bufferClone: BufferAttribute | undefined;
    // calculates center point of each radial cross-section - probably same data as catmulRom curve pts
    bufferSpineVecs: Vector3[] = [];
    bufferSpineVecsInit: Vector3[] = [];
    tubeMeshSpine: Line | undefined;

    strands: VerletStrand[] = [];



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

            // let x = 0;
            // let y = this.dim.y / 2 - step * i;
            // let z = 0;

            // x-axis
            // let x = this.dim.x / 2 - step * i;
            // let y = Math.sin(theta) * this.dim.y;
            // let z = Math.cos(theta) * this.dim.z;

            //z-axis
            // let x = Math.cos(theta) * this.dim.x;
            // let y = Math.sin(theta) * this.dim.y;
            // let z = this.dim.z / 2 - step * i;

            this.pathVecs[i] = new Vector3(x, y, z);
            theta += Math.PI / 180;
        }

        const path = new CatmullRomCurve3(this.pathVecs);


        const texture = new TextureLoader().load("textures/leather_skin.jpg");
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(3, 1);

        this.boneCount = 5;
        this.spineGeom = new ProtoTubeGeometry(path, tubeSegs / 10, 12, false, { func: FuncType.SINUSOIDAL, min: 5, max: 80, periods: 1 }, this.boneCount);
        //this.spineGeom = new ProtoTubeGeometry(path, 10, 4, false, { func: FuncType.SINUSOIDAL_INVERSE, min: 30, max: 80, periods: 3 }, this.boneCount);
        this.curveLenth = this.spineGeom.pathLen;
        this.curveLengths = this.spineGeom.pathSegmentLengths;

        const spineMat = new MeshPhongMaterial({ color: 0xff5555, wireframe: true, side: DoubleSide, map: texture, transparent: true, opacity: 1, bumpMap: texture, bumpScale: 1, shininess: .1 });

        this.boneCount = this.spineGeom.boneCount;
        this.curveLenth = this.spineGeom.pathLen;
        this.curveLengths = this.spineGeom.pathSegmentLengths;


        this.tubeMesh = new Mesh(this.spineGeom, spineMat);
        this.radialSegs = this.spineGeom.radialSegments;
        this.bufferClone = this.tubeMesh.geometry.attributes.position.clone();
        this.add(this.tubeMesh);
        // this.skinMesh = this.makeSkinned(this.tubeMesh, this.boneCount, this.curveLenth);
        // this.add(this.skinMesh);

        // const skelHelper = new SkeletonHelper(this.skinMesh);
        // this.add(skelHelper);

        // calulate and display spine position at each each index for custom deformation
        if (this.spineGeom && this.bufferClone) {
            let position = this.tubeMesh.geometry.attributes.position;
            for (let i = 0, k = 0; i < position.count; i += (this.spineGeom.radialSegments + 1)) {
                let vec = new Vector3();
                for (let j = 0; j <= this.spineGeom.radialSegments; j++) {
                    let l = i + j;
                    vec.add(new Vector3(this.bufferClone.getX(l), this.bufferClone.getY(l), this.bufferClone.getZ(l)));
                }
                vec.divideScalar(this.spineGeom.radialSegments);
                this.bufferSpineVecs.push(vec);
                this.bufferSpineVecsInit.push(vec);
            }
        }
        // display spine
        const geometry = new BufferGeometry().setFromPoints(this.bufferSpineVecs);
        this.tubeMeshSpine = new Line(geometry, new LineBasicMaterial({ color: "0xdd0000" }));
        // this.add(this.tubeMeshSpine);

        // hanging tendrils
        for (let i = 0; i < this.radialSegs; i++) {
            //skin.geometry.attributes.position.
            let vecs = this.tubeMesh.geometry.attributes.position;
            let head = new Vector3(vecs.getX(vecs.count - 1 - this.radialSegs + i), vecs.getY(vecs.count - 1 - this.radialSegs + i), vecs.getZ(vecs.count - 1 - this.radialSegs + i));
            let tail = new Vector3(vecs.getX(vecs.count - 1 - this.radialSegs + i), vecs.getY(vecs.count - 1 - this.radialSegs + i) * -.2, vecs.getZ(vecs.count - 1 - this.radialSegs + i));

            this.strands[i] = new VerletStrand(head, tail, 30, AnchorPoint.HEAD, .98, GeometryDetail.SPHERE_LOW);
            this.strands[i].setNodesColor(new Color(0xff2222));
            this.strands[i].setNodesVisible(true);
            this.strands[i].setNodesOpacity(.3);
            this.strands[i].setNodesScale(30);
            this.strands[i].setStrandOpacity(.3);
            this.strands[i].setStrandColor(new Color(0xff2222));
            this.add(this.strands[i]);
        }

    }

    move(time: number) {
        if (this.skinMesh) {
            this.skinMesh.skeleton.bones[2].rotation.y = Math.cos(time) * 5 / this.skinMesh.skeleton.bones.length;
            this.skinMesh.skeleton.bones[3].rotation.z = Math.sin(time) * 8 / this.skinMesh.skeleton.bones.length;
            this.skinMesh.skeleton.bones[1].rotation.x = Math.sin(time) * 2 / this.skinMesh.skeleton.bones.length;
            this.skinMesh.skeleton.bones[0].rotation.y = Math.sin(time) * 2 / this.skinMesh.skeleton.bones.length;

        }

        if (this.tubeMesh) {
            //this.tubeMeshSpine!.geometry.attributes.position.needsUpdate = true;
            let position = this.tubeMesh.geometry.attributes.position;
            position.needsUpdate = true;
            // console.log("position.count/64 = ", position.count/this.spineGeom!.radialSegments);
            if (this.spineGeom && this.bufferClone) {
                //console.log("position.count = ", position.count);
                //console.log("this.spineGeom.pathSegmentLengths = ", this.spineGeom.pathSegmentLengths);
                //console.log("this.curveLenth = ", this.curveLenth);
                // console.log("this.spineGeom.radialSegments = ", this.spineGeom.radialSegments);
                for (let i = 0, k = 0, ctr = this.bufferSpineVecs.length+2; i < position.count; i += (this.spineGeom.radialSegments + 1)) {
                    // test at row 100
                    // console.log(k);
                    // if (k == 26) {
                    //let d = this.bufferSpineVecs[ctr];
                    let deformPos = Math.max(0, (this.bufferSpineVecs.length) - (Math.abs((k - ctr))));
                    //console.log("deformPos = ", deformPos);
                    for (let j = 0; j <= this.spineGeom.radialSegments; j++) {
                        let l = i + j;
                        let amp = 1 + Math.abs(sin(phi) * deformPos * .02);
                        let vec = new Vector3(this.bufferClone.getX(l), this.bufferClone.getY(l), this.bufferClone.getZ(l));
                        vec.sub(this.bufferSpineVecs[k])
                        //this.bufferSpineVecs
                        //  this.bufferSpineVecs[k].y = this.bufferSpineVecsInit[k].y+ Math.sin(phi2) * .12;
                        // this.bufferSpineVecs[k].z = this.bufferSpineVecsInit[k].z + Math.cos(phi2) * .02;
                        position.setXYZ((l), this.bufferSpineVecs[k].x + vec.x * amp,
                            this.bufferSpineVecs[k].y + vec.y * amp,
                            this.bufferSpineVecs[k].z + vec.z * amp);

                    }
                    // }


                    k++;
                }
                // for (let i = 0; i < this.bufferSpineVecs.length; i++) {
                //     this.bufferSpineVecs[i].x += 3;
                //     //this.bufferSpineVecs[i].y = this.bufferSpineVecsInit[i].y + Math.sin(phi2) * 2.12;
                // }
            }
        }
        phi += PI / 230;
        phi2 -= PI / 30;

        let vecs = this.tubeMesh!.geometry.attributes.position;
        if (this.radialSegs) {
            //console.log(vecs.getX(vecs.count - 1 - this.radialSegs + 0));
            for (let i = 0; i < this.strands.length; i++) {
                this.strands[i].setHeadPosition(new Vector3(vecs.getX(vecs.count - 1 - this.radialSegs + i), vecs.getY(vecs.count - 1 - this.radialSegs + i), vecs.getZ(vecs.count - 1 - this.radialSegs + i)));

                this.strands[i].verlet();
            }
        }
    }
}


