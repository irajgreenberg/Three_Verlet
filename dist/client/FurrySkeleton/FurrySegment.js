import * as THREE from '/build/three.module.js';
import { Vector3 } from '/build/three.module.js';
import { AnchorPoint } from '../PByte3/IJGUtils.js';
import { VerletStrand } from '../PByte3/VerletStrand.js';
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
        // draw limb
        this.add(this.line);
        // calculate hair anchor points along limb
        let segMag = new Vector3();
        segMag.subVectors(this.joint2, this.joint1);
        segMag.divideScalar(this.segments);
        let headVec = new Vector3();
        headVec.set(this.joint1.x, this.joint1.y, this.joint1.z);
        let tailVec = new Vector3();
        tailVec.set(this.joint1.x * 1.4, this.joint1.y * 1.4, this.joint1.z * 1.4);
        // tailVec.normalize();
        // tailVec.multiplyScalar(this.furLength);
        for (let i = 0; i < segments; i++) {
            this.furStrands[i] = new VerletStrand(headVec.add(segMag), tailVec.add(segMag), 20, AnchorPoint.HEAD);
            this.furStrands[i].setStrandOpacity(.35);
            this.add(this.furStrands[i]);
        }
    }
    move() {
        for (let i = 0; i < this.furStrands.length; i++) {
            this.furStrands[i].verlet();
            this.furStrands[i].moveNode(this.furStrands[i].segmentCount - 1, new Vector3(-.01 + Math.random() * .01, -.01 + Math.random() * .01, -.01 + Math.random() * .01));
        }
    }
}
