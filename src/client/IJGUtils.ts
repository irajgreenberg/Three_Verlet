import * as THREE from '/build/three.module.js';

// Verlet stick terminal anchoring
export enum AnchorPoint {
    NONE,
    HEAD,
    TAIL,
    HEAD_TAIL,
    MOD2,
    RAND
}

// Organism propulsion
export class Propulsion {
    direction: THREE.Vector3;
    force: THREE.Vector3;
    frequency: THREE.Vector3;

    constructor(direction: THREE.Vector3 = new THREE.Vector3(0, 1, 0),
        force: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
        frequency: THREE.Vector3 = new THREE.Vector3(0, 0, 0)) {
        this.direction = direction;
        this.force = force;
        this.frequency = frequency;
    }
}
