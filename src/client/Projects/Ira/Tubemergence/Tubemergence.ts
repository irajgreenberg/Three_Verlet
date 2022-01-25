// Tubemergence
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { Group, Vector3, PlaneGeometry, MeshPhongMaterial, Mesh, DoubleSide, SphereGeometry, TubeGeometry, PointLight, Clock, CatmullRomCurve3, RepeatWrapping, TextureLoader } from 'three';
import { cos, FuncType, PI, sin } from "../../../PByte3/IJGUtils";
import { randFloat } from 'three/src/math/MathUtils';
import { ProtoTubeGeometry } from '../../../PByte3/ProtoTubeGeometry';

let a = 0;

export class Tubemergence extends Group {
    groundGeom: PlaneGeometry | undefined;
    groundMat: MeshPhongMaterial | undefined;
    groundMesh: Mesh | undefined;

    // particle
    // collects particle postion
    parts: Vector3[] = [];

    pos: Vector3;
    rad: number;
    spd: Vector3;
    grav: number;
    damp: number;
    frict: number;
    sphereGeom: SphereGeometry | undefined;
    sphereMat: MeshPhongMaterial | undefined;
    sphereMesh: Mesh | undefined;

    // tube
    //tubeGeom: TubeGeometry | undefined;
    tubeGeom: ProtoTubeGeometry | undefined;
    tubeMat: MeshPhongMaterial | undefined;
    tubeMesh: Mesh | undefined;
    isTubeDrawable = false;
    // texture: TextureLoader | undefined;

    fallBool = true;
    isRecordable = true;


    constructor() {
        super();
        this.pos = new Vector3(0, 500, 0);
        this.rad = 2.5;
        this.spd = new Vector3(randFloat(-1.2, 1.2), -.1, randFloat(-.2, .2));
        this.grav = -.03;
        this.damp = .65;
        this.frict = .1;

        // this.texture = new TextureLoader().load("textures/leather2.jpg");
        // this.texture.wrapS = RepeatWrapping;
        // this.texture.wrapT = RepeatWrapping;
        // this.texture.repeat.set(3, 3);


        this.create();
    }

    create() {
        this.groundGeom = new PlaneGeometry(2000, 2000);
        this.groundMat = new MeshPhongMaterial({ color: 0x443366, side: DoubleSide });
        this.groundMesh = new Mesh(this.groundGeom, this.groundMat);
        this.groundMesh.rotation.x = PI / 2;
        this.add(this.groundMesh);
        this.groundMesh.receiveShadow = true;

        this.sphereGeom = new SphereGeometry(this.rad);
        this.sphereMat = new MeshPhongMaterial({ color: 0x441122 });
        this.sphereMesh = new Mesh(this.sphereGeom, this.sphereMat);
        this.sphereMesh.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.sphereMesh.receiveShadow = true;
        this.sphereMesh.castShadow = true;
        this.add(this.sphereMesh);


    }
    move(time: number) {
        if (this.sphereMesh && this.groundMesh) {
            this.spd.y += this.grav;
            this.sphereMesh.position.add(this.spd);
            this.spd.x = sin(time * PI / 60) * randFloat(4, 8)
            this.spd.z = cos(time * PI / 30) * randFloat(5, 10)
            //this.sphereMesh.position.x - sin(time * PI / 60) * 130

            // if (time % 1 == 0) {
            if (this.isRecordable) {
                this.parts.push(new Vector3().set(this.sphereMesh.position.x, this.sphereMesh.position.y, this.sphereMesh.position.z))
            }

            if (this.sphereMesh.position.y <= this.groundMesh.position.y + this.rad) {
                this.sphereMesh.position.y = this.groundMesh.position.y + this.rad
                this.spd.y *= -1;
                this.spd.y *= this.damp;
                this.spd.x *= this.frict;
                this.spd.z *= this.frict;
                // console.log("this.spd.y = ", this.spd.y);
                if (Math.abs(this.spd.y) < 0.01) {
                    this.isRecordable = false;
                    this.drawTube();
                }
            }
        }
        // this.pos.add(this.spd);
        // if (this.sphereMesh) {
        //     let pos = this.sphereMesh.geometry.attributes.position;
        //     this.sphereMesh.position.add(this.pos);
        // }



    }

    drawTube() {
        const texture = new TextureLoader().load("textures/leather2.jpg");
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(40, 1);

        // console.log(this.parts);
        let curve = new CatmullRomCurve3(this.parts);
        //this.tubeGeom = new TubeGeometry(curve, 250, 10, 6, false);

        this.tubeGeom = new ProtoTubeGeometry(curve, 250, 36, false, { func: FuncType.SINUSOIDAL, min: 1, max: 20, periods: 12 });

        this.tubeMat = new MeshPhongMaterial({ color: 0xFFFFFF, map: texture, });
        this.tubeMesh = new Mesh(this.tubeGeom, this.tubeMat);
        //this.tubeMesh.position.x = randFloat(-200, 200);
        this.add(this.tubeMesh);
        this.tubeMesh.castShadow = true;
        this.isTubeDrawable = false;


    }
}


