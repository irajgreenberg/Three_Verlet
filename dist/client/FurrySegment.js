import * as THREE from '/build/three.module.js';
import { AnchorPoint } from './PByte3/IJGUtils.js';
import { VerletStrand } from './PByte3/VerletStrand.js';
export class FurrySegment extends THREE.Group {
    constructor(joint1, joint2, segments, furLength) {
        super();
        this.lineGeometry = new THREE.Geometry();
        this.furStrands = [];
        this.joint1 = joint1;
        this.joint2 = joint2;
        this.segments = segments;
        this.furLength = furLength;
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xcc55cc });
        this.lineGeometry.vertices.push(this.joint1);
        this.lineGeometry.vertices.push(this.joint2);
        this.line = new THREE.Line(this.lineGeometry, this.lineMaterial);
        this.lineMaterial.transparent = true;
        this.lineMaterial.opacity = .95;
        this.add(this.line);
        for (let i = 0; i < segments; i++) {
            this.furStrands[i] = new VerletStrand(this.joint1, this.joint2, 10, AnchorPoint.HEAD);
            this.add(this.furStrands[i]);
        }
    }
    move() {
    }
}
