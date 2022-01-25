// Protobyte_0007
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import {
  CatmullRomCurve3,
  DoubleSide,
  Mesh,
  MeshPhongMaterial,
  RepeatWrapping,
  SkeletonHelper,
  SkinnedMesh,
  TextureLoader,
  Vector3,
  TubeGeometry,
  BufferAttribute,
} from "three";
import { cos, FuncType, PI, sin } from "../../../PByte3/IJGUtils";
import { ProtoTubeBase } from "../../../PByte3/ProtoTubeBase";
import { ProtoTubeGeometry } from "../../../PByte3/ProtoTubeGeometry";
import { VerletAnnulusGeometry2 } from "../../../PByte3/VerletAnnulusGeometry2";

let theta = 0;
let phi = 0;
let freq = PI / 90;
let freq2 = PI / 180;
let amp = 20.4;

//for testing serpentine motion of mesh
let thetas: number[] = []; export class Protobyte_0007 extends ProtoTubeBase {
  annulusGeom: VerletAnnulusGeometry2 | undefined;
  annulusMesh: Mesh | undefined;

  tubeGeom: ProtoTubeGeometry | undefined;
  bufferClone: BufferAttribute | undefined;

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

    // this.boneCount = 5;
    // this.tubeGeom = new ProtoTubeGeometry(
    //   path,
    //   tubeSegs / 10,
    //   20,
    //   false,
    //   { func: FuncType.SINUSOIDAL_INVERSE, min: 30, max: 80, periods: 3 },
    //   this.boneCount
    // );

    let tubeSections = 14;
    let radialSections = 36;
    this.tubeGeom = new ProtoTubeGeometry(path, tubeSections, radialSections, false, { func: FuncType.SINUSOIDAL, min: 1, max: 20, periods: 1 }, this.boneCount);

    this.curveLenth = this.tubeGeom.pathLen;
    this.curveLengths = this.tubeGeom.pathSegmentLengths;

    const tubeMat = new MeshPhongMaterial({
      color: 0xffffff,
      wireframe: false,
      side: DoubleSide,
      map: texture,
      transparent: true,
      opacity: 1,
      /* bumpMap: texture, */ bumpScale: 1,
      shininess: 0.1,
    });

    //this.boneCount = tubeGeom.boneCount;
    this.curveLenth = this.tubeGeom.pathLen;
    this.curveLengths = this.tubeGeom.pathSegmentLengths;

    this.tubeMesh = new Mesh(this.tubeGeom, tubeMat);
    this.add(this.tubeMesh);

    this.bufferClone = this.tubeMesh.geometry.attributes.position.clone();


    const annulusMat = new MeshPhongMaterial({
      color: 0xFF7777,
      wireframe: false,
      side: DoubleSide,
      map: textureAnnulus,
      transparent: true,
      opacity: .8,
      /* bumpMap: texture, */ bumpScale: 1,
      shininess: 0.6,
    });
    let radialCount = this.tubeGeom.radialSegments;
    // console.log("radialCount = ", radialCount);

    this.annulusGeom = new VerletAnnulusGeometry2(30, 60, radialCount, 2, 0);
    this.annulusMesh = new Mesh(this.annulusGeom, annulusMat);
    this.add(this.annulusMesh);

    let nodes = this.annulusGeom.nodes;
    for (let n of nodes) {
      n.geometry.scale(1, 1, 1);
      // this.add(n);
    }

    let sticks = this.annulusGeom.sticks;
    for (let s of sticks) {
      s.setOpacity(0);
      //this.add(s);
    }
  }

  move(time: number) {
    if (this.annulusGeom && this.annulusMesh) {
      this.annulusGeom.verlet();

      let pos = this.annulusMesh.geometry.attributes.position;
      pos.needsUpdate = true;

      for (let i = 0, j = 0; i < pos.count; i++) {
        let x = this.annulusGeom.nodes2[i].position.x;
        let y = this.annulusGeom.nodes2[i].position.y;
        let z = this.annulusGeom.nodes2[i].position.z;
        pos.setXYZ(i, x, y, z);
      }
    }

    let tubeMeshPosition = this.tubeMesh!.geometry.attributes.position;
    tubeMeshPosition.needsUpdate = true;

    for (let i = 0, k = 0; i < this.tubeGeom!.tubularSegments + 1; i++) {
      if (i == Math.floor(this.tubeGeom!.tubularSegments / 2)) {
        for (let j = 0; j < this.tubeGeom!.radialSegments; j++) {
          k = i * (this.tubeGeom!.radialSegments + 1) + j;
          this.annulusGeom!.headNodes[j].position.x = tubeMeshPosition.getX(k) * .95;
          this.annulusGeom!.headNodes[j].position.y = tubeMeshPosition.getY(k) * .95;
          this.annulusGeom!.headNodes[j].position.z = tubeMeshPosition.getZ(k) * .95;
        }
      }
    }

    // for (let i = 0; i <= posInit.count; i++) {
    //   let d = Math.sqrt(Math.pow(pos.getX(i) - base.x, 2) +
    //     Math.pow(pos.getY(i) - base.y, 2) +
    //     Math.pow(pos.getZ(i) - base.z, 2));
    //   // console.log("d = ", d);
    //   pos.setX(i, posInit.getX(i) + sin(theta) * amp * d * .06);
    //   pos.setY(i, posInit.getY(i));
    //   pos.setZ(i, posInit.getZ(i));
    //   theta += freq;
    for (let i = 0; i <= this.tubeGeom!.tubularSegments; i++) {
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
        // if (this.hairs[k]) {
        //     this.hairs[k].setHeadPosition(new Vector3(x, y, z));
        //     this.hairs[k].verlet();
        // }
        // if (this.annulus && j == 0 && i < posInit.count) {
        //     // console.log(x);
        //     //this.annulus.headNodes[j].position.x  = x;
        //     // this.annulus.headNodes[j].position.setY(y);
        //     // this.annulus.headNodes[j].position.setZ(z);
        // }
      }
      thetas[i] += freq;
    }



  }

}
