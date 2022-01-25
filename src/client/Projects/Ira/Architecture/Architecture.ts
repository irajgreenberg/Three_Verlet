// Architecture
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { Box3, BoxGeometry, DoubleSide, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D, PlaneGeometry, SphereGeometry, Vector3 } from "three";
import { randFloat } from "three/src/math/MathUtils";
import { FuncType, PI } from "../../../PByte3/IJGUtils";

export class Architecture extends Group {

    planeMesh: Mesh;

    bldgCount = 100;
    sphereMesh: InstancedMesh;
    m: Matrix4[] = [];
    pos: Vector3[] = [];
    spd: Vector3[] = [];
    scl: Vector3[] = [];
    gdf: Vector3[] = []; // grav/damp/fric
    aabb: Box3;

    isCityBuildable = 0;
    perimeterCounter = 0;
    perimeterCounterLimit = 40;
    bldgMesh: InstancedMesh;
    bldgScl: Vector3[] = [];

    collisionCount = 300;
    collisisonBlocks: Mesh[] = [];
    collisionAabb: Box3[] = [];


    constructor() {
        super();

        let planeGeom = new PlaneGeometry(42000, 42000);
        let planeMat = new MeshBasicMaterial({ color: 0x6655bb, side: DoubleSide });
        this.planeMesh = new Mesh(planeGeom, planeMat);
        this.planeMesh.rotateX(PI / 2)
        this.add(this.planeMesh);
        this.aabb = new Box3().setFromObject(this.planeMesh);
        //console.log(this.aabb);


        let sphereGeom = new SphereGeometry(1);
        this.sphereMesh = new InstancedMesh(sphereGeom, new MeshBasicMaterial(), this.bldgCount);
        this.add(this.sphereMesh);

        let bldgGeom = new BoxGeometry(1, 1, 1)
        let bldgMat = new MeshPhongMaterial({ color: 0x666677 })
        this.bldgMesh = new InstancedMesh(bldgGeom, bldgMat, this.bldgCount);
        //this.add(this.sphereMesh);

        // collision blocks
        for (let i = 0; i < this.collisionCount; i++) {
            let geom = new BoxGeometry(randFloat(500, 1000), 800, randFloat(500, 2000));

            this.collisisonBlocks[i] = new Mesh(geom, new MeshBasicMaterial({ color: 0x228844 }));
            this.collisisonBlocks[i].position.x = randFloat(-this.aabb.min.x * .8, this.aabb.min.x * .8);
            this.collisisonBlocks[i].position.z = randFloat(-this.aabb.min.z * .8, this.aabb.min.z * .8);
            this.add(this.collisisonBlocks[i]);
            this.collisionAabb[i] = new Box3().setFromObject(this.collisisonBlocks[i]);
        }


        for (let i = 0; i < this.bldgCount; i++) {
            this.pos[i] = new Vector3(randFloat(-2500, 2500), randFloat(8300, 14000), randFloat(-2500, 2500));
            this.spd[i] = new Vector3(randFloat(-72, 72), randFloat(-3, -1), randFloat(-72, 72));
            let s = randFloat(5, 35);
            this.scl[i] = new Vector3(s, s, s);
            let dummy = new Object3D();
            dummy.position.set(this.pos[i].x, this.pos[i].y, this.pos[i].z);
            dummy.scale.set(this.scl[i].x, this.scl[i].y, this.scl[i].z);
            dummy.updateMatrix();
            this.sphereMesh.setMatrixAt(i, dummy.matrix);
            this.gdf[i] = new Vector3(randFloat(-2.1, -5.3), randFloat(.5, .725), randFloat(.6, .9));

            this.bldgScl[i] = new Vector3(randFloat(200, 1000), randFloat(1000, 10000), randFloat(200, 1000));
        }


    }


    move(time: number) {
        for (let i = 0; i < this.bldgCount; i++) {
            this.spd[i].y += this.gdf[i].x;
            this.pos[i].add(this.spd[i]);
            if (this.pos[i].y <= this.planeMesh.position.y + this.scl[i].y) {
                this.pos[i].y = this.planeMesh.position.y + this.scl[i].y;
                this.spd[i].y *= -1;
                this.spd[i].y *= this.gdf[i].y;
                this.spd[i].x *= this.gdf[i].z;
                this.spd[i].z *= this.gdf[i].z;
            }

            if (this.pos[i].x <= this.aabb.min.x + this.scl[i].x) {
                this.pos[i].x = this.aabb.min.x + this.scl[i].x
                this.spd[i].x *= -1;
                this.perimeterCounter++
            } else if (this.pos[i].x >= this.aabb.max.x - this.scl[i].x) {
                this.pos[i].x = this.aabb.max.x - this.scl[i].x
                this.spd[i].x *= -1;
                this.perimeterCounter++
            }

            if (this.pos[i].z <= this.aabb.min.z + this.scl[i].z) {
                this.pos[i].z = this.aabb.min.z + this.scl[i].z
                this.spd[i].z *= -1;
                this.perimeterCounter++
            } else if (this.pos[i].z >= this.aabb.max.z - this.scl[i].z) {
                this.pos[i].z = this.aabb.max.z - this.scl[i].z
                this.spd[i].x *= -1;
                this.perimeterCounter++
            }

            // obstacles
            for (let j = 0; j < this.collisionCount; j++) {
                if (this.pos[i].x <= this.collisionAabb[j].max.x + this.scl[i].x / 2 + this.bldgScl[i].x / 2 &&
                    this.pos[i].z <= this.collisionAabb[j].max.z &&
                    this.pos[i].z >= this.collisionAabb[j].min.z &&
                    this.pos[i].y < 100) {
                    this.pos[i].x = this.collisionAabb[j].max.x + this.scl[i].x / 2 + this.bldgScl[i].x / 2;
                    this.spd[i].x *= -1;
                } else if (this.pos[i].x >= this.collisionAabb[j].min.x - this.scl[i].x / 2 - this.bldgScl[i].x / 2 &&
                    this.pos[i].z <= this.collisionAabb[j].max.z &&
                    this.pos[i].z >= this.collisionAabb[j].min.z &&
                    this.pos[i].y < 100) {
                    this.pos[i].x = this.collisionAabb[j].min.x - this.scl[i].x / 2 - this.bldgScl[i].x / 2;
                    this.spd[i].x *= -1;
                }

                if (this.pos[i].z <= this.collisionAabb[j].max.z + this.scl[i].z + this.bldgScl[i].z / 2 &&
                    this.pos[i].x <= this.collisionAabb[j].max.x &&
                    this.pos[i].x >= this.collisionAabb[j].min.x &&
                    this.pos[i].z < 100) {
                    this.pos[i].z = this.collisionAabb[j].max.z + this.scl[i].z + this.bldgScl[i].z / 2;
                    this.spd[i].z *= -1;
                } else if (this.pos[i].z >= this.collisionAabb[j].min.z - this.scl[i].z - this.bldgScl[i].z / 2 &&
                    this.pos[i].x <= this.collisionAabb[j].max.x &&
                    this.pos[i].x >= this.collisionAabb[j].min.x &&
                    this.pos[i].z < 100) {
                    this.pos[i].z = this.collisionAabb[j].min.z - this.scl[i].z - this.bldgScl[i].z / 2;
                    this.spd[i].z *= -1;
                }

            }

            let dummy = new Object3D();
            dummy.position.set(this.pos[i].x, this.pos[i].y, this.pos[i].z);
            dummy.scale.set(this.scl[i].x, this.scl[i].y, this.scl[i].z);
            dummy.updateMatrix();
            this.sphereMesh.setMatrixAt(i, dummy.matrix);;
            this.sphereMesh.instanceMatrix.needsUpdate = true;
            // this.gdf[i] = new Vector3(randFloat(.001, .1), randFloat(.5, .875), randFloat(.7, .9));

            // enough time has passed to spawn the city
            if (this.perimeterCounter === this.perimeterCounterLimit) {

                // this.add(this.bldgMesh);


                this.perimeterCounter++;
            }

            dummy.position.set(this.pos[i].x, this.pos[i].y + this.bldgScl[i].y / 2, this.pos[i].z);
            dummy.scale.set(this.bldgScl[i].x, this.bldgScl[i].y, this.bldgScl[i].z);
            dummy.updateMatrix();
            this.bldgMesh.setMatrixAt(i, dummy.matrix);;
            this.bldgMesh.instanceMatrix.needsUpdate = true;

        }
    }
}


