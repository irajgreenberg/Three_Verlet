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

// Axes for drawing plane
export enum AxesPlane {
    XY_AXIS,
    YZ_AXIS,
    ZX_AXIS
}


// Verlet plane edge/corner anchoring
export enum AnchorPlane {
    NONE,
    CORNER_ALL,
    CORNER_0,
    CORNER_1,
    CORNER_2,
    CORNER_3,
    CORNER_02,
    CORNER_13,
    EDGES_ALL,
    EDGE_LEFT,
    EDGE_RIGHT,
    EDGE_TOP,
    EDGE_BOTTOM,
    RAND_VERT
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
    spineNodeColor: THREE.Color = new THREE.Color(.5, .5, .5);
    spineColor: THREE.Color = new THREE.Color(.5, .5, .5);
    spineAlpha: number = 1.0;
    sliceColor: THREE.Color = new THREE.Color(.5, .5, .5);
    sliceAlpha: number = 1.0;
    tendrilNodeColor: THREE.Color = new THREE.Color(.5, .5, .5);
    tendrilColor: THREE.Color = new THREE.Color(.5, .5, .5);
    tendrilAlpha: number = 1.0;
    ciliaNodeColor: THREE.Color = new THREE.Color(.5, .5, .5);
    ciliaColor: THREE.Color = new THREE.Color(.5, .5, .5);
    ciliaAlpha: number = 1.0;

    constructor(
        spineNodeColor: THREE.Color = new THREE.Color(.5, .5, .5),
        spineColor: THREE.Color = new THREE.Color(.5, .5, .5),
        spineAlpha: number = .5,
        sliceColor: THREE.Color = new THREE.Color(.5, .5, .5),
        sliceAlpha: number = .5,
        tendrilNodeColor: THREE.Color = new THREE.Color(.5, .5, .5),
        tendrilColor: THREE.Color = new THREE.Color(.5, .5, .5),
        tendrilAlpha: number = .5,
        ciliaNodeColor: THREE.Color = new THREE.Color(.5, .5, .5),
        ciliaColor: THREE.Color = new THREE.Color(.5, .5, .5),
        ciliaAlpha: number = .5) {

        this.spineNodeColor = spineNodeColor;
        this.spineColor = spineColor;
        this.spineAlpha = spineAlpha;
        this.sliceColor = sliceColor;
        this.sliceAlpha = sliceAlpha;
        this.tendrilNodeColor = tendrilNodeColor;
        this.tendrilColor = tendrilColor;
        this.tendrilAlpha = tendrilAlpha;
        this.ciliaNodeColor = ciliaNodeColor;
        this.ciliaColor = ciliaColor;
        this.ciliaAlpha = ciliaAlpha;
    }
}
