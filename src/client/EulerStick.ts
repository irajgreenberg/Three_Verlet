// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall

// Springing based no Euler motion and simple interia
// manages constraint of head and tail vecs
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------

import * as THREE from '/build/three.module.js';

export class EulerStick {

    // Note: for now keep non-dependent properties public
    head: THREE.Vector3;
    headSpeed: THREE.Vector3;
    private tail: THREE.Vector3;
    private tailSpeed: THREE.Vector3;
    springFactor: number;
    springDamping: number;

    constructor(head: THREE.Vector3, tail: THREE.Vector3, springFactor: number = .4, springDamping: number = .775, initialHeadSpeed: THREE.Vector3 = new THREE.Vector3()) {
        this.head = head;
        this.tail = tail;
        this.springFactor = springFactor;
        this.springDamping = springDamping;
        this.headSpeed = initialHeadSpeed;
        this.tailSpeed = new THREE.Vector3();
    }

    public move(): void {
        this.head.add(this.headSpeed);
        this.constrain();
    }

    private constrain(): void {
        //move center point
        let deltaX = this.head.x - this.tail.x;
        let deltaY = this.head.y - this.tail.y;
        let deltaZ = this.head.z - this.tail.z;

        // create springing effect
        deltaX *= this.springFactor;
        deltaY *= this.springFactor;
        deltaZ *= this.springFactor;
        this.tailSpeed.x += deltaX;
        this.tailSpeed.y += deltaY;
        this.tailSpeed.z += deltaZ;

        // move predator's center
        this.tail.x += this.tailSpeed.x;
        this.tail.y += this.tailSpeed.y;
        this.tail.z += this.tailSpeed.z;

        // slow down springing
        this.tailSpeed.x *= this.springDamping;
        this.tailSpeed.y *= this.springDamping;
        this.tailSpeed.z *= this.springDamping;
    }
}