// Tubemergence04
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { Group, Vector3, PlaneGeometry, MeshPhongMaterial, Mesh, DoubleSide, Color } from 'three';
import { EnvironmentPhysics, PI } from "../../../PByte3/IJGUtils";
import { randFloat } from 'three/src/math/MathUtils';
import { SculptureSeed } from './SculptureSeed';

let a = 0;
interface iWalls { left: PlaneGeometry, front: PlaneGeometry, right: PlaneGeometry, back: PlaneGeometry };

export class Tubemergence04 extends Group {
    groundGeom: PlaneGeometry | undefined;
    groundMat: MeshPhongMaterial | undefined;
    groundMesh: Mesh | undefined;

    walls: iWalls | undefined;

    seed: SculptureSeed | undefined;

    seedCount = 50;
    seeds: SculptureSeed[] = [];

    constructor() {
        super();
        this.create();
    }

    create() {
        this.groundGeom = new PlaneGeometry(2000, 2000);
        this.groundMat = new MeshPhongMaterial({ color: 0x443366, side: DoubleSide });
        this.groundMesh = new Mesh(this.groundGeom, this.groundMat);
        this.groundMesh.rotation.x = PI / 2;
        this.add(this.groundMesh);
        this.groundMesh.receiveShadow = true;

        if (this.walls) {
            this.walls.left = new PlaneGeometry(2000, 2000);
            this.walls.front = new PlaneGeometry(2000, 2000);
            this.walls.right = new PlaneGeometry(2000, 2000);
            this.walls.back = new PlaneGeometry(2000, 2000);
        }

        for (let i = 0; i < this.seedCount; i++) {
            this.seeds[i] = new SculptureSeed(new Vector3(randFloat(-185, 185), randFloat(500, 900), randFloat(-290, 290)), new Vector3(randFloat(-4.9, 4.9), randFloat(-.2, -.1), randFloat(-4.9, 4.9)), 6, new Color(0xff9900), new EnvironmentPhysics(randFloat(-.09, -.1), randFloat(.7, .98), .45, new Vector3(0, 0, 0)));
            this.add(this.seeds[i]);
        }
    }

    move(time: number) {
        for (let i = 0; i < this.seedCount; i++) {
            if (this.seeds[i] && this.seeds[i].sphereMesh) {
                this.seeds[i].move(time);
                if (this.groundMesh) {
                    if (this.seeds[i].sphereMesh!.position.y <= this.groundMesh.position.y + this.seeds[i].rad) {
                        this.seeds[i].sphereMesh!.position.y = this.groundMesh.position.y + this.seeds[i].rad
                        this.seeds[i].spd.y *= -1;
                        this.seeds[i].spd.y *= this.seeds[i].envPhys.damping;
                        this.seeds[i].spd.x *= this.seeds[i].envPhys.friction;
                        this.seeds[i].spd.z *= this.seeds[i].envPhys.friction;
                        if (this.seeds[i].spd.length() < 1) {
                            this.seeds[i].isRecordable = false;
                        }

                    }
                }
            }
        }
    }
}


