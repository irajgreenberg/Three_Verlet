//import { Vector3, Color} from 'three';
import { Vector3, Color} from '/build/three.module.js';

// Verlet stick terminal anchoring
export enum AnchorPoint {
    NONE,
    HEAD,
    TAIL,
    HEAD_TAIL,
    MOD2,
    RAND
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
    direction: Vector3;
    force: Vector3;
    frequency: Vector3;

    constructor(direction: Vector3 = new Vector3(0, 1, 0),
        force: Vector3 = new Vector3(0, 0, 0),
        frequency: Vector3 = new Vector3(0, 0, 0)) {
        this.direction = direction;
        this.force = force;
        this.frequency = frequency;
    }
}

// Organism Materials
export class VerletMaterials {
    spineNodeColor: Color = new Color(.5, .5, .5);
    spineColor: Color = new Color(.5, .5, .5);
    spineAlpha: number = 1.0;
    sliceColor: Color = new Color(.5, .5, .5);
    sliceAlpha: number = 1.0;
    tendrilNodeColor: Color = new Color(.5, .5, .5);
    tendrilColor: Color = new Color(.5, .5, .5);
    tendrilAlpha: number = 1.0;
    ciliaNodeColor: Color = new Color(.5, .5, .5);
    ciliaColor: Color = new Color(.5, .5, .5);
    ciliaAlpha: number = 1.0;

    constructor(
        spineNodeColor: Color = new Color(.5, .5, .5),
        spineColor: Color = new Color(.5, .5, .5),
        spineAlpha: number = .5,
        sliceColor: Color = new Color(.5, .5, .5),
        sliceAlpha: number = .5,
        tendrilNodeColor: Color = new Color(.5, .5, .5),
        tendrilColor: Color = new Color(.5, .5, .5),
        tendrilAlpha: number = .5,
        ciliaNodeColor: Color = new Color(.5, .5, .5),
        ciliaColor: Color = new Color(.5, .5, .5),
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
