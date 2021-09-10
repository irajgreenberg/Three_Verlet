// Simple class for storing quad data
// including normals

import * as THREE from '/build/three.module.js';
import { Vector3 } from '/build/three.module.js';
import { VerletNode } from "./VerletNode";


export class VerletQuad extends THREE.Group {
    v0: VerletNode;
    v1: VerletNode;
    v2: VerletNode;
    v3: VerletNode;

    side0 = new Vector3(); // 1-0
    side1 = new Vector3(); // 3-1

    norm: Vector3;
    centroid: Vector3;

    // for drawing normal
    normalLine: THREE.Line
    normalLineGeometry = new THREE.Geometry();
    normalLineMaterial: THREE.LineBasicMaterial;

    constructor(v0: VerletNode, v1: VerletNode, v2: VerletNode, v3: VerletNode) {
        super();
        this.v0 = v0;
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;

        this.norm = this.getNormal();
        this.centroid = this.getCentroid();

        this.normalLineMaterial = new THREE.LineBasicMaterial({ color: 0xcc55cc });
        this.normalLineGeometry.vertices.push(this.centroid);
        let v = new Vector3();
        v.addVectors(this.centroid, this.norm);
        this.normalLineGeometry.vertices.push(v.multiplyScalar(-.125));
        this.normalLineMaterial = new THREE.LineBasicMaterial({ color: 0xcc55cc });
        this.normalLine = new THREE.Line(this.normalLineGeometry, this.normalLineMaterial);
        this.normalLineMaterial.transparent = true;
        this.normalLineMaterial.opacity = .95;
        this.add(this.normalLine);
    }

    // returns normalized vector
    getNormal(): Vector3 {
        this.side0.subVectors(this.v1.position, this.v0.position);
        this.side1.subVectors(this.v3.position, this.v0.position);
        return this.side0.cross(this.side1).normalize();
    }

    // returns center point
    getCentroid(): Vector3 {
        let cntr = new Vector3();
        cntr.add(this.v0.position);
        cntr.add(this.v1.position);
        cntr.add(this.v2.position);
        cntr.add(this.v3.position);
        cntr.divideScalar(4);
        return cntr;
    }

    drawNormal() {
        this.normalLineGeometry.verticesNeedUpdate = true;
        this.normalLineMaterial.needsUpdate = true;
    }
}