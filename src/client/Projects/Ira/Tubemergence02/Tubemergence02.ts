// Tubemergence02
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { Group, Vector3, PlaneGeometry, MeshPhongMaterial, Mesh, DoubleSide, SphereGeometry, TubeGeometry, PointLight, Clock, CatmullRomCurve3, Vector } from 'three';
import { cos, FuncType, PI, sin } from "../../../PByte3/IJGUtils";
import { randFloat } from 'three/src/math/MathUtils';

let a = 0;

export class Tubemergence02 extends Group {
    groundGeom: PlaneGeometry | undefined;
    groundMat: MeshPhongMaterial | undefined;
    groundMesh: Mesh | undefined;

    // particle count
    partCount = 3;

    // collects particle postion
    parts: Vector3[] = [];
    parts2D: Vector3[][] = []; // 2D array of coords for tube creation

    pos: Vector3[] = [];
    rad: number[] = [];
    spd: Vector3[] = [];
    grav: number[] = [];
    damp: number[] = [];
    frict: number[] = [];

    // spheres
    sphereGeom: SphereGeometry[] = [];
    sphereMat: MeshPhongMaterial[] = [];
    sphereMesh: Mesh[] = [];

    // tubes
    tubeGeom: TubeGeometry[] = [];
    tubeMat: MeshPhongMaterial[] = [];
    tubeMesh: Mesh[] = [];
    isTubeDrawable: boolean[] = [];
    curves: CatmullRomCurve3[] = [];

    //fallBool = true;
    isRecordable: boolean[] = [];


    constructor() {
        super();
        for (let i = 0; i < this.partCount; i++) {
            this.pos[i] = new Vector3(randFloat(-300, 300), randFloat(300, 600), randFloat(-300, 300));
            this.rad[i] = randFloat(4, 8);
            this.spd[i] = new Vector3(randFloat(-1.2, 1.2), -.1, randFloat(-1.2, 1.2));
            this.grav[i] = randFloat(-.03, -.2);
            this.damp[i] = randFloat(.65, .8);
            this.frict[i] = randFloat(.01, .05);
            this.isRecordable[i] = true;
            // add empty 1D arr to 2D arr
            // populated dynamically in move
            this.parts2D[i] = this.parts;
        }

        this.create();
    }

    create() {
        this.groundGeom = new PlaneGeometry(2000, 2000);
        this.groundMat = new MeshPhongMaterial({ color: 0x443366, side: DoubleSide });
        this.groundMesh = new Mesh(this.groundGeom, this.groundMat);
        this.groundMesh.rotation.x = PI / 2;
        this.add(this.groundMesh);
        this.groundMesh.receiveShadow = true;

        for (let i = 0; i < this.partCount; i++) {
            this.sphereGeom[i] = new SphereGeometry(this.rad[i]);
            this.sphereMat[i] = new MeshPhongMaterial({ color: 0x441122 });
            this.sphereMesh[i] = new Mesh(this.sphereGeom[i], this.sphereMat[i]);
            this.sphereMesh[i].position.set(this.pos[i].x, this.pos[i].y, this.pos[i].z);
            this.sphereMesh[i].receiveShadow = true;
            this.sphereMesh[i].castShadow = true;
            this.add(this.sphereMesh[i]);
        }
    }
    move(time: number) {
        for (let i = 0; i < this.partCount; i++) {
            if (this.sphereMesh[i] && this.groundMesh) {
                this.spd[i].y += this.grav[i];
                this.sphereMesh[i].position.add(this.spd[i]);
                this.spd[i].x = sin(time * PI / 60) * randFloat(4, 8)
                this.spd[i].z = cos(time * PI / 30) * randFloat(5, 10)
                //this.sphereMesh.position.x - sin(time * PI / 60) * 130

                // if (time % 1 == 0) {
                if (this.isRecordable[i]) {
                    // while (Math.abs(this.spd[i].y) > 0.05 && this.isRecordable[i]) {
                    this.parts2D[i].push(new Vector3().set(this.sphereMesh[i].position.x, this.sphereMesh[i].position.y, this.sphereMesh[i].position.z))
                }

                if (this.sphereMesh[i].position.y <= this.groundMesh.position.y + this.rad[i]) {
                    this.sphereMesh[i].position.y = this.groundMesh.position.y + this.rad[i]
                    this.spd[i].y *= -1;
                    this.spd[i].y *= this.damp[i];
                    this.spd[i].x *= this.frict[i];
                    this.spd[i].z *= this.frict[i];
                    //console.log("this.spd[i].y = ", this.spd[i].y);
                    if (Math.abs(this.spd[i].y) < 0.05 && this.isRecordable[i]) {
                        this.isRecordable[i] = false;
                        //this.drawTube(this.parts2D[i]);

                        this.curves[i] = new CatmullRomCurve3(this.parts2D[i]);
                        this.tubeGeom[i] = new TubeGeometry(this.curves[i], 250, 5, 6, false);
                        this.tubeMat[i] = new MeshPhongMaterial({ color: 0xaa6600 });
                        this.tubeMesh[i] = new Mesh(this.tubeGeom[i], this.tubeMat[i]);
                        //this.tubeMesh.position.x = randFloat(-200, 200);
                        this.add(this.tubeMesh[i]);
                        this.tubeMesh[i].castShadow = true;
                        this.isTubeDrawable[i] = false;
                    }
                }
            }

        }

    }

    // drawTube(parts: Vector3[]) {
    //     //console.log(this.parts2D[i]);
    //     let curve = new CatmullRomCurve3(parts);
    //     this.tubeGeom[i] = new TubeGeometry(curve, 250, 5, 6, false);
    //     this.tubeMat[i] = new MeshPhongMaterial({ color: 0xaa6600 });
    //     this.tubeMesh[i] = new Mesh(this.tubeGeom[i], this.tubeMat[i]);
    //     //this.tubeMesh.position.x = randFloat(-200, 200);
    //     this.add(this.tubeMesh[i]);
    //     this.tubeMesh[i].castShadow = true;
    //     this.isTubeDrawable[i] = false;


    // }
}


