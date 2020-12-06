// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall
// Springing based on Euler motion and simple interia
// manages constraint of start and end vecs
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------
import * as THREE from '/build/three.module.js';
export class EulerStick {
    constructor(start, end, springFactor = .4, springDamping = .775, initialstartSpeed = new THREE.Vector3()) {
        this.start = start;
        this.end = end;
        this.springFactor = springFactor;
        this.springDamping = springDamping;
        this.startSpeed = initialstartSpeed;
        this.endSpeed = new THREE.Vector3();
    }
    move() {
        this.start.add(this.startSpeed);
        this.constrain();
    }
    constrain() {
        //move center point
        let deltaX = this.start.x - this.end.x;
        let deltaY = this.start.y - this.end.y;
        let deltaZ = this.start.z - this.end.z;
        // create springing effect
        deltaX *= this.springFactor;
        deltaY *= this.springFactor;
        deltaZ *= this.springFactor;
        this.endSpeed.x += deltaX;
        this.endSpeed.y += deltaY;
        this.endSpeed.z += deltaZ;
        // move predator's center
        this.end.x += this.endSpeed.x;
        this.end.y += this.endSpeed.y;
        this.end.z += this.endSpeed.z;
        // slow down springing
        this.endSpeed.x *= this.springDamping;
        this.endSpeed.y *= this.springDamping;
        this.endSpeed.z *= this.springDamping;
    }
}
