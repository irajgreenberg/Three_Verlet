// reflection expression
// R = 2N(N*L)-L

import { CatmullRomCurve3, Color, Group, Mesh, MeshPhongMaterial, SphereGeometry, TubeGeometry, Vector3 } from "three";
import { randFloat } from "three/src/math/MathUtils";
import { cos, EnvironmentPhysics, PI, Quad, sin } from "../../../PByte3/IJGUtils";

export class SculptureSeed extends Group {
    pos: Vector3
    spd: Vector3
    rad: number;
    col: Color;
    envPhys: EnvironmentPhysics;

    // for capturing
    coords: Vector3[] = [];
    isRecordable = true;

    sphereGeom: SphereGeometry | undefined;
    sphereMat: MeshPhongMaterial | undefined;
    sphereMesh: Mesh | undefined;

    // tubes
    tubeGeom: TubeGeometry | undefined;
    tubeMat: MeshPhongMaterial | undefined;
    tubeMesh: Mesh | undefined;
    isTubeDrawable: boolean | undefined;
    curves: CatmullRomCurve3 | undefined;


    constructor(pos: Vector3, spd: Vector3, rad: number, col: Color, envPhys: EnvironmentPhysics) {
        super();
        this.pos = pos;
        this.spd = spd;
        this.rad = rad;
        this.col = col;
        this.envPhys = envPhys;

        this.init();
    }

    init(): void {
        this.sphereGeom = new SphereGeometry(this.rad);
        this.sphereMat = new MeshPhongMaterial({ color: 0x441122 });
        this.sphereMesh = new Mesh(this.sphereGeom, this.sphereMat);
        this.sphereMesh.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.sphereMesh.receiveShadow = true;
        this.sphereMesh.castShadow = true;
        this.add(this.sphereMesh);
    }

    move(time: number, surfaces: Quad[]): void {

        if (this.sphereMesh) {
            this.spd.y += this.envPhys.gravity;
            this.sphereMesh.position.add(this.spd);
            this.spd.x = sin(time * PI / 60) * randFloat(4, 8)
            this.spd.z = cos(time * PI / 30) * randFloat(5, 10)

            if (this.isRecordable) {
                this.coords.push(new Vector3().set(this.sphereMesh.position.x, this.sphereMesh.position.y, this.sphereMesh.position.z))
            }

            // if (this.sphereMesh.position.y <= this.groundMesh.position.y + this.rad) {
            //     this.sphereMesh.position.y = this.groundMesh.position.y + this.rad
            //     this.spd.y *= -1;
            //     this.spd.y *= this.envPhys.damping;
            //     this.spd.x *= this.envPhys.friction;
            //     this.spd.z *= this.envPhys.friction;
            //     //console.log("this.spd.y = ", this.spd.y);
            //     if (Math.abs(this.spd.y) < 0.05 && this.isRecordable) {
            //         this.isRecordable = false;
            //         //this.drawTube(this.parts2D);

            //         this.curves = new CatmullRomCurve3(this.parts2D);
            //         this.tubeGeom = new TubeGeometry(this.curves, 250, 5, 6, false);
            //         this.tubeMat = new MeshPhongMaterial({ color: 0xaa6600 });
            //         this.tubeMesh = new Mesh(this.tubeGeom, this.tubeMat);
            //         //this.tubeMesh.position.x = randFloat(-200, 200);
            //         this.add(this.tubeMesh);
            //         this.tubeMesh.castShadow = true;
            //         this.isTubeDrawable = false;
            //     }
            // }
        }

    }


}