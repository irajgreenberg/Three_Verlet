// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall
import * as THREE from '/build/three.module.js';
export class EulerStick {
    constructor(start, end, springFactor = .4, springDamping = .775) {
        this.start = start;
        this.end = end;
        this.springFactor = springFactor;
        this.springDamping = springDamping;
        this.endSpeed = new THREE.Vector3();
    }
    constrainLen() {
        //move center point
        let deltaX = this.start.position.x - this.end.position.x;
        let deltaY = this.start.position.y - this.end.position.y;
        let deltaZ = this.start.position.z - this.end.position.z;
        // create springing effect
        deltaX *= this.springFactor;
        deltaY *= this.springFactor;
        deltaZ *= this.springFactor;
        this.endSpeed.x += deltaX;
        this.endSpeed.y += deltaY;
        this.endSpeed.z += deltaZ;
        // move predator's center
        this.end.position.x += this.endSpeed.x;
        this.end.position.y += this.endSpeed.y;
        this.end.position.z += this.endSpeed.z;
        // slow down springing
        this.endSpeed.x *= this.springDamping;
        this.endSpeed.y *= this.springDamping;
        this.endSpeed.z *= this.springDamping;
    }
}
