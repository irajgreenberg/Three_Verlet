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
    constructor(head, tail, springFactor = .4, springDamping = .775, initialHeadSpeed = new THREE.Vector3()) {
        this.head = head;
        this.tail = tail;
        this.springFactor = springFactor;
        this.springDamping = springDamping;
        this.headSpeed = initialHeadSpeed;
        this.tailSpeed = new THREE.Vector3();
    }
    move() {
        this.head.add(this.headSpeed);
        this.constrain();
    }
    constrain() {
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
