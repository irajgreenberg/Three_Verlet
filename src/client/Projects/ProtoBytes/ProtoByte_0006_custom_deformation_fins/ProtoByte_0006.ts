// ProtoByte_0006
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX


// Better Comments extension
// TODO's in orange
// ! Alerts in red
// ? in blue

// ProtoTubeGeometry NOTES: 
// 1. Tube geometry has a copy of radialSegment[0]. I think this is ued for uv mapping
//    If you want to attach other geometry to tube, attachments points will be < radialSegments.length-1
// 2. Tube sections will be 1 less than vertex cross-sections (e.g. :-:, 1 tube section, 2 vertex cross-sections)
// 3. this.geometry.attributes.position.count = (radialSegments+1) * (tubeSegments+1)

import { VerletStrand } from "../../../PByte3/VerletStrand";
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, DoubleSide, Line, LineBasicMaterial, Mesh, MeshPhongMaterial, RepeatWrapping, RingGeometry, SkeletonHelper, SkinnedMesh, TextureLoader, Vector3 } from "three";
import { AnchorPoint, cos, FuncType, GeometryDetail, PI, sin } from "../../../PByte3/IJGUtils";
import { ProtoTubeBase } from "../../../PByte3/ProtoTubeBase";
import { ProtoTubeGeometry } from "../../../PByte3/ProtoTubeGeometry";
import { VerletAnnulusGeometry } from "../../../PByte3/VerletAnnulusGeometry";

let theta = 0;
let phi = 0;
let freq = PI / 90;
let freq2 = PI / 180;
let amp = 20.4;

//for testing serpentine motion of mesh
let thetas: number[] = [];



export class ProtoByte_0006 extends ProtoTubeBase {

    skinMesh: SkinnedMesh | undefined;
    tubeGeom: ProtoTubeGeometry | undefined;

    bufferClone: BufferAttribute | undefined;
    // calculates center point of each radial cross-section - probably same data as catmulRom curve pts
    bufferSpineVecs: Vector3[] = [];
    bufferSpineVecsInit: Vector3[] = [];
    tubeMeshSpine: Line | undefined;
    tubeMeshSpineInit: Line | undefined;

    hairs: VerletStrand[] = [];

    annulus: VerletAnnulusGeometry | undefined;
    annulusIndex: number = 0;
    annulusIndices: number[] = []; //!not yet implemented



    // ring geomety testing
    annulus2Geom: RingGeometry | undefined;
    annulus2: Mesh | undefined;

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

            thetas[i] = Math.PI / 180 * i * 30;
        }

        const path = new CatmullRomCurve3(this.pathVecs);
        //console.log("path.getPoints().length = ", path.getPoints().length);


        const texture = new TextureLoader().load("textures/humanSkin02.jpg");
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(3, 1);

        this.boneCount = 5;
        let tubeSections = 14;
        let radialSections = 30;
        this.tubeGeom = new ProtoTubeGeometry(path, tubeSections, radialSections, false, { func: FuncType.SINUSOIDAL, min: 1, max: 20, periods: 1 }, this.boneCount);

        this.curveLenth = this.tubeGeom.pathLen;
        this.curveLengths = this.tubeGeom.pathSegmentLengths;

        const spineMat = new MeshPhongMaterial({ color: 0xFFFFFF, wireframe: false, side: DoubleSide, map: texture, transparent: true, opacity: .9, /*bumpMap: texture,*/ bumpScale: 1, shininess: .95 });

        this.boneCount = this.tubeGeom.boneCount;
        this.curveLenth = this.tubeGeom.pathLen;
        this.curveLengths = this.tubeGeom.pathSegmentLengths;

        this.tubeMesh = new Mesh(this.tubeGeom, spineMat);
        this.print();

        this.bufferClone = this.tubeMesh.geometry.attributes.position.clone();
        this.add(this.tubeMesh);
        // this.skinMesh = this.makeSkinned(this.tubeMesh, this.boneCount, this.curveLenth);
        //this.add(this.skinMesh);

        // const skelHelper = new SkeletonHelper(this.skinMesh);
        // this.add(skelHelper);


        // calulate and display spine position at each each index for custom deformation
        if (this.tubeGeom && this.bufferClone) {
            let position = this.tubeMesh.geometry.attributes.position;
            for (let i = 0, k = 0; i < position.count; i += (this.tubeGeom.radialSegments + 1)) {
                let vec = new Vector3();
                for (let j = 0; j <= this.tubeGeom.radialSegments; j++) {
                    let l = i + j;
                    vec.add(new Vector3(this.bufferClone.getX(l), this.bufferClone.getY(l), this.bufferClone.getZ(l)));
                }
                vec.divideScalar(this.tubeGeom.radialSegments);
                this.bufferSpineVecs.push(vec);
                this.bufferSpineVecsInit.push(vec);
            }
        }
        // display spine
        const geometry = new BufferGeometry().setFromPoints(this.bufferSpineVecs);
        this.tubeMeshSpine = new Line(geometry, new LineBasicMaterial({ color: "0xFF8800" }));
        this.tubeMeshSpineInit = new Line(geometry, new LineBasicMaterial({ color: "0xFF8800" }));
        // this.add(this.tubeMeshSpine);

        let vecs = this.tubeMesh.geometry.attributes.position;
        for (let i = 0, j = 0; i < vecs.count; i++) {
            let r = (this.tubeGeom!.radialSegments + 1);
            let head = new Vector3(vecs.getX(vecs.count - 1 - r), vecs.getY(vecs.count - 1 - r), vecs.getZ(vecs.count - 1 - r));
            let tail = new Vector3(vecs.getX(vecs.count - 1 - r), vecs.getY(vecs.count - 1 - r) * -.001, vecs.getZ(vecs.count - 1 - r));

            // if (i % 31 == 0) {
            //     this.hairs[j] = new VerletStrand(head, tail, 25, AnchorPoint.HEAD, .58, GeometryDetail.TRI);
            //     // this.hairs[i].setNodesColor(new Color(0xff2222));
            //     this.hairs[j].setNodesVisible(true);
            //     this.hairs[j].setNodesOpacity(.3);
            //     this.hairs[j].setNodesScale(30);
            //     this.hairs[j].setStrandOpacity(.2);
            //     this.hairs[j].setStrandColor(new Color(0xff2222));
            //     this.add(this.hairs[j]);
            //     j++
            // }
        }

        // create annulus
        let meshEdgeVecs: Vector3[] = [];
        for (let i = 0, k = 0; i < this.tubeGeom!.tubularSegments + 1; i++) {
            if (i == Math.floor(this.tubeGeom!.tubularSegments / 2)) {
                this.annulusIndex = i;
                for (let j = 0; j < this.tubeGeom!.radialSegments; j++) {
                    k = i * (this.tubeGeom!.radialSegments + 1) + j
                    let v = new Vector3(vecs.getX(k), vecs.getY(k), vecs.getZ(k));
                    meshEdgeVecs.push(v);
                }
            }
        }
        this.annulus = new VerletAnnulusGeometry(meshEdgeVecs, 125, 12);
        this.add(this.annulus);
        //console.log("this.annulus.nodes = ", this.annulus.nodes);

        // console.log("vecs = ", vecs.count);
        // console.log("tubularSegments = ", this.tubeGeom!.tubularSegments);
        // console.log("radialSegments = ", this.tubeGeom!.radialSegments);
        // console.log("vecs/radialSegments = ", vecs.count / (this.tubeGeom!.radialSegments + 1));

        // test with RingGeometry

        // this.annulus2Geom = new RingGeometry(60, 200, meshEdgeVecs.length, 12);
        // this.annulus2 = new Mesh(this.annulus2Geom, spineMat);
        // this.add(this.annulus2);
        this.print();

    }

    // TODO: maybe add print function to ProtoTubeGeometry class
    print(): void {
        if (this.tubeMesh && this.tubeGeom) {
            console.log("\n**************\nTube Mesh Data \n**************\ncount = ",
                this.tubeMesh.geometry.attributes.position.count, "\nradialSegments = ", (this.tubeGeom.radialSegments + 1),
                "\ntubularSegments = ", (this.tubeGeom.tubularSegments + 1), "\n**************\n\n"
            );
        }
    }

    move(time: number) {
        // if (this.skinMesh) {
        //     this.skinMesh.skeleton.bones[2].rotation.y = Math.cos(time) * 5 / this.skinMesh.skeleton.bones.length;
        //     this.skinMesh.skeleton.bones[3].rotation.z = Math.sin(time) * 8 / this.skinMesh.skeleton.bones.length;
        //     this.skinMesh.skeleton.bones[1].rotation.x = Math.sin(time) * 2 / this.skinMesh.skeleton.bones.length;
        //     this.skinMesh.skeleton.bones[0].rotation.y = Math.sin(time) * 2 / this.skinMesh.skeleton.bones.length;

        // }
        let tubeMeshPosition = this.tubeMesh!.geometry.attributes.position;
        tubeMeshPosition.needsUpdate = true;

        if (this.tubeMeshSpine && this.tubeMeshSpineInit) {
            let pos = this.tubeMeshSpine.geometry.attributes.position;
            // if (this.annulus){
            //     this.annulus.headNodes[9].position.x  = pos.getX(5);
            // }
            let posInit = this.tubeMeshSpineInit.geometry.attributes.position;
            //console.log("posInit.count = ", posInit.count);
            let base = new Vector3(posInit.getX(0), posInit.getY(0), posInit.getZ(0));
            // pos.needsUpdate = true;
            posInit.needsUpdate = true;
            for (let i = 0; i <= posInit.count; i++) {
                let d = Math.sqrt(Math.pow(pos.getX(i) - base.x, 2) +
                    Math.pow(pos.getY(i) - base.y, 2) +
                    Math.pow(pos.getZ(i) - base.z, 2));
                // console.log("d = ", d);
                pos.setX(i, posInit.getX(i) + sin(theta) * amp * d * .06);
                pos.setY(i, posInit.getY(i));
                pos.setZ(i, posInit.getZ(i));
                theta += freq;

                for (let j = 0, k = 0; j <= this.tubeGeom!.radialSegments; j++) {
                    k = i * (this.tubeGeom!.radialSegments + 1) + j;
                    // rocking
                    // let x = this.bufferClone!.getX(k) + sin(theta) * amp * d * .06;
                    // let y = this.bufferClone!.getY(k);// + pos.getY(i);
                    // let z = this.bufferClone!.getZ(k);// + pos.getZ(i);

                    // snake
                    let x = this.bufferClone!.getX(k) + sin(thetas[i]) * amp
                    let y = this.bufferClone!.getY(k) + cos(thetas[i]) * amp;// + pos.getY(i);
                    let z = this.bufferClone!.getZ(k);// + pos.getZ(i);


                    tubeMeshPosition.setXYZ(k, x, y, z);
                    if (this.hairs[k]) {
                        this.hairs[k].setHeadPosition(new Vector3(x, y, z));
                        this.hairs[k].verlet();
                    }
                    if (this.annulus && j == 0 && i < posInit.count) {
                        // console.log(x);
                        //this.annulus.headNodes[j].position.x  = x;
                        // this.annulus.headNodes[j].position.setY(y);
                        // this.annulus.headNodes[j].position.setZ(z);
                    }
                }
                thetas[i] += freq;
            }
            // theta += freq;
            // //phi += freq;
        }

        if (this.annulus) {
            this.annulus.verlet();
            let n = this.tubeMesh!.geometry.attributes.position;

            // this.annulus.tailNodes[0].position.x = this.bufferClone!.getX(4 * this.tubeGeom!.radialSegments);
            // this.annulus.tailNodes[0].position.y = this.bufferClone!.getY(4 * this.tubeGeom!.radialSegments);
            // this.annulus.tailNodes[0].position.z = this.bufferClone!.getZ(4 * this.tubeGeom!.radialSegments);

            for (let i = 0, k = 0; i < this.tubeGeom!.tubularSegments + 1; i++) {
                if (i == Math.floor(this.tubeGeom!.tubularSegments / 2)) {
                    for (let j = 0; j < this.tubeGeom!.radialSegments; j++) {
                        k = i * (this.tubeGeom!.radialSegments + 1) + j;
                        this.annulus.tailNodes[j].position.x = tubeMeshPosition.getX(k);
                        this.annulus.tailNodes[j].position.y = tubeMeshPosition.getY(k);
                        this.annulus.tailNodes[j].position.z = tubeMeshPosition.getZ(k);
                    }
                }
            }
        }
    }
}


