// reflection expression
// R = 2N(N*L)-L

import { CatmullRomCurve3, Color, Group, Mesh, MeshPhongMaterial, RepeatWrapping, SphereGeometry, TextureLoader, TubeGeometry, Vector3 } from "three";
import { randFloat, randInt } from "three/src/math/MathUtils";
import { cos, EnvironmentPhysics, FuncType, PI, sin } from "../../../PByte3/IJGUtils";
import { ProtoTubeGeometry } from "../../../PByte3/ProtoTubeGeometry";

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
    curve: CatmullRomCurve3 | undefined;
    tubeCounter = 0;


    constructor(pos: Vector3, spd: Vector3, rad: number, col: Color, envPhys: EnvironmentPhysics) {
        super();
        this.pos = pos;
        this.spd = spd;
        this.rad = rad;
        this.col = col;
        this.envPhys = envPhys;

        this._init();
    }

    _init(): void {
        this.sphereGeom = new SphereGeometry(this.rad);
        this.sphereMat = new MeshPhongMaterial({ color: 0xFFAA11 });
        this.sphereMesh = new Mesh(this.sphereGeom, this.sphereMat);
        this.sphereMesh.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.sphereMesh.receiveShadow = true;
        this.sphereMesh.castShadow = true;
        this.add(this.sphereMesh);
    }

    move(time: number): void {

        if (this.sphereMesh) {

            this.spd.y += this.envPhys.gravity;
            this.sphereMesh.position.add(this.spd);
            // this.spd.x = sin(time * PI / randFloat(20, 180)) * this.spd.y
            // this.spd.z = cos(time * PI / randFloat(20, 180)) * this.spd.y

            if (this.isRecordable) {
                this.coords.push(new Vector3().set(this.sphereMesh.position.x, this.sphereMesh.position.y, this.sphereMesh.position.z))
            } else if (this.tubeCounter++ < 1) {
                this.curve = new CatmullRomCurve3(this.coords);
                this.tubeGeom = new ProtoTubeGeometry(this.curve, 250, 18, false, { func: FuncType.SINUSOIDAL, min: randInt(1, 10), max: randInt(10, 60), periods: randInt(1, 12) });

                const texture = new TextureLoader().load("textures/leather2.jpg");
                texture.wrapS = RepeatWrapping;
                texture.wrapT = RepeatWrapping;
                texture.repeat.set(40, 1);
                // this.tubeGeom = new TubeGeometry(this.curves, 250, 5, 6, false);
                this.tubeMat = new MeshPhongMaterial({ color: 0xaa6600, map: texture });
                this.tubeMesh = new Mesh(this.tubeGeom, this.tubeMat);
                //this.tubeMesh.position.x = randFloat(-200, 200);
                this.add(this.tubeMesh);
                this.tubeMesh.castShadow = true;
            }

        }

    }


}