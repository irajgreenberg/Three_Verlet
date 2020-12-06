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

    // Note: for now keep non-dependent properties public
    start: THREE.Vector3;
    startSpeed: THREE.Vector3;
    private end: THREE.Vector3;
    private endSpeed: THREE.Vector3;
    springFactor: number;
    springDamping: number;

    constructor(start: THREE.Vector3, end: THREE.Vector3, springFactor: number = .4, springDamping: number = .775, initialstartSpeed: THREE.Vector3 = new THREE.Vector3()) {
        this.start = start;
        this.end = end;
        this.springFactor = springFactor;
        this.springDamping = springDamping;
        this.startSpeed = initialstartSpeed;
        this.endSpeed = new THREE.Vector3();
    }

    public move(): void {
        this.start.add(this.startSpeed);
        this.constrain();
    }

    private constrain(): void {
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