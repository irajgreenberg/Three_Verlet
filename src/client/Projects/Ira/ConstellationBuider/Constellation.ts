// Constellation, 2022
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX | Santa Fe, NM

import { BoxGeometry, BufferGeometry, Group, InstancedMesh, Line, LineBasicMaterial, Matrix4, MeshBasicMaterial, SphereGeometry, Vector3, Vector2 } from "three";
import { randFloat, randInt } from "three/src/math/MathUtils";
import { cos, GeometryDetail, PI, sin } from "../../../PByte3/IJGUtils";

export class Constellation extends Group {

    posExtrema: Vector3;
    spdExtrema: Vector3;
    proximity: Vector2;
    partCount = 0;
    tempPartCounter = 0;
    counter = randFloat(1.5, 5.5);

    radius: number;
    pos: Vector3[] = [];
    spd: Vector3[] = [];
    spdInit: Vector3[] = [];
    spdFreq: Vector3[] = [];
    spdAmp: Vector3[] = [];
    partGeom: BufferGeometry | undefined;
    partMat: MeshBasicMaterial;
    partIMesh: InstancedMesh;
    m: Matrix4[] = [];

    // Part connecting lines
    lineCount: number;
    lineGeom: BufferGeometry[] = [];
    lineMat: LineBasicMaterial[] = [];
    lineMesh: Line[] = [];
    lineCounter = 0
    dynamicLineLenCount = randFloat(5, 15);

    constructor(posExtrema: Vector3, spdExtrema: Vector3, proximity: Vector2, partCount: number, lineCount: number, radius: number, geomType: GeometryDetail, partMat: MeshBasicMaterial, lineMat: LineBasicMaterial) {
        super();
        this.posExtrema = posExtrema;
        this.spdExtrema = spdExtrema;
        this.proximity = proximity;
        this.partCount = partCount;
        this.lineCount = lineCount;
        this.radius = radius;

        if (geomType == GeometryDetail.CUBE) {
            this.partGeom = new BoxGeometry(this.radius * 2, this.radius * 2, this.radius * 2);
        } else if (geomType == GeometryDetail.SPHERE_LOW) {
            this.partGeom = new SphereGeometry(this.radius, 3, 3);

        }
        this.partMat = partMat;
        this.partIMesh = new InstancedMesh(this.partGeom, this.partMat, this.partCount);
        this.add(this.partIMesh);
        for (let i = 0; i < this.partCount; i++) {
            this.pos[i] = new Vector3(
                randFloat(-this.posExtrema.x, this.posExtrema.x),
                randFloat(-this.posExtrema.y, this.posExtrema.y),
                randFloat(-this.posExtrema.z, this.posExtrema.z));
            this.spd[i] = new Vector3(
                randFloat(-this.spdExtrema.x, this.spdExtrema.x),
                randFloat(-this.spdExtrema.y, this.spdExtrema.y),
                randFloat(-this.spdExtrema.z, this.spdExtrema.z));
            this.spdInit[i] = new Vector3();
            this.spdInit[i].set(this.spd[i].x, this.spd[i].y, this.spd[i].z);
            this.spdFreq[i] = new Vector3(randFloat(PI / 5, PI / 10), randFloat(PI / 5, PI / 10), randFloat(PI / 5, PI / 10));
            this.spdAmp[i] = new Vector3(randFloat(-5, 5), randFloat(-5, 5), randFloat(-5, 5));
            this.m[i] = new Matrix4();
            this.m[i].setPosition(this.pos[i]);
        }

        // Part line
        let points = [];
        points.push(new Vector3(0, 0, 0));
        points.push(new Vector3(0, 0, 0));
        //points.push(new Vector3(500, 30, 0));

        for (let i = 0; i < this.lineCount; i++) {
            this.lineGeom[i] = new BufferGeometry().setFromPoints(points);
            this.lineMat[i] = lineMat;
            this.lineMesh[i] = new Line(this.lineGeom[i], this.lineMat[i]);
            this.add(this.lineMesh[i]);
        }
    }

    move(time: number, orbRadius: number) {
        for (let i = 0.0; i < this.tempPartCounter; i++) {
            let p = this.partIMesh.getObjectById(i);
            this.partIMesh.setMatrixAt(i, this.m[i]);
            this.partIMesh.instanceMatrix.needsUpdate = true;
            this.m[i].setPosition(this.pos[i]);
            this.spd[i].x = this.spdInit[i].x + sin(time * this.spdFreq[i].x) * this.spdAmp[i].x;
            this.spd[i].y = this.spdInit[i].y + cos(time * this.spdFreq[i].y) * this.spdAmp[i].y;
            this.spd[i].z = this.spdInit[i].z + cos(time * this.spdFreq[i].z) * this.spdAmp[i].z;
            this.pos[i].add(this.spd[i]);
            if (this.pos[i].length() >= orbRadius - 2) {
                this.pos[i].normalize();
                this.pos[i].multiplyScalar(orbRadius - 2);
                this.spd[i].multiplyScalar(-1);
            }

            for (let j = 0.0; j < this.tempPartCounter; j++) {
                if (i !== j) {
                    if (this.pos[i].distanceTo(this.pos[j]) < this.dynamicLineLenCount) {
                        if (this.lineCounter < this.lineCount) {
                            let p = this.lineMesh[this.lineCounter].geometry.attributes.position;
                            p.needsUpdate = true;
                            p.setXYZ(0, this.pos[i].x, this.pos[i].y, this.pos[i].z);
                            p.setXYZ(1, this.pos[j].x, this.pos[j].y, this.pos[j].z);
                            this.lineCounter++;
                        } else {
                            this.lineCounter = 0;
                            this.dynamicLineLenCount = randInt(this.proximity.x, this.proximity.y);
                        }
                    }
                }
            }
        }
        if (this.tempPartCounter < this.partCount - this.counter) {
            this.tempPartCounter += this.counter;
        }
    }

}