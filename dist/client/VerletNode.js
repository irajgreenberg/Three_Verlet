// This class supports development
// of an 'independent' softbody organism.
// This work is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall
// Simple verlet node
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------
import * as THREE from '/build/three.module.js';
export class VerletNode extends THREE.SphereGeometry {
    constructor(pos, radius = 0.005) {
        super(radius);
        this.radius = radius;
        this.pos = pos;
        this.posOld = new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z);
    }
}
