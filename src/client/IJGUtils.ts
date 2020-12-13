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


// Verlet stick terminal anchoring
export enum GeometryDetail {
    TRI = 3,
    QUAD = 4,
    PENT = 5,
    HEX = 6,
    HEP = 7,
    OCT = 8,
    DEC = 10,
    DODEC = 12,
    TETRA,
    CUBE,
    OCTA,
    ICOSA,
    DODECA,
    SPHERE_LOW,
    SPHERE_MED,
    SPHERE_HIGH,
    SPHERE_SUPERHIGH,
    SPHERE_SUPERDUPERHIGH
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

// Organism Materials
export class VerletMaterials {
    nodeRadius: number = .01;
    nodeColor: THREE.Color = new THREE.Color(.5, .5, .5);
    nodeAlpha: number = 1.0;
    spineColor: THREE.Color = new THREE.Color(.5, .5, .5);
    spineAlpha: number = 1.0;
    sliceColor: THREE.Color = new THREE.Color(.5, .5, .5);
    sliceAlpha: number = 1.0;
    tendrilColor: THREE.Color = new THREE.Color(.5, .5, .5);
    tendrilAlpha: number = 1.0;

    constructor(
        nodeRadius: number = .001,
        nodeColor: THREE.Color = new THREE.Color(.5, .5, .5),
        nodeAlpha: number = .5,
        spineColor: THREE.Color = new THREE.Color(.5, .5, .5),
        spineAlpha: number = .5,
        sliceColor: THREE.Color = new THREE.Color(.5, .5, .5),
        sliceAlpha: number = .5,
        tendrilColor: THREE.Color = new THREE.Color(.5, .5, .5),
        tendrilAlpha: number = .5) {

        this.nodeRadius = nodeRadius;
        this.nodeColor = nodeColor;
        this.nodeAlpha = nodeAlpha;
        this.spineColor = spineColor;
        this.spineAlpha = spineAlpha;
        this.sliceColor = sliceColor;
        this.sliceAlpha = sliceAlpha;
        this.tendrilColor = tendrilColor;
        this.tendrilAlpha = tendrilAlpha;
    }
}
