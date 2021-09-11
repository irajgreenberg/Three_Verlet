
import { Color, Geometry, Group, Line, LineBasicMaterial, Vector3 } from '/build/three.module.js';

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

// Convenience class to group 4 vectors
// includes quad centroid and normal
export class Quad extends Group {
    v0: Vector3;
    v1: Vector3;
    v2: Vector3;
    v3: Vector3;

    // used internally for normal calucations
    private side0: Vector3 = new Vector3();
    private side1: Vector3 = new Vector3();
    private norm: Vector3 = new Vector3();

    private isNormalVisible: boolean = false;
    private normalAlpha: number = 0;

    // for centroid
    private cntr: Vector3 = new Vector3();

    lineGeometry = new Geometry();
    lineMaterial = new LineBasicMaterial({ color: 0xFF9900 });
    line: Line;

    constructor(v0: Vector3, v1: Vector3, v2: Vector3, v3: Vector3) {
        super();
        this.v0 = v0;
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;

        // for drawing normal
        this.lineGeometry.vertices = [];
        this.lineGeometry.vertices.push(this.getCentroid());
        this.lineGeometry.vertices.push(this.getNormal());

        this.line = new Line(this.lineGeometry, this.lineMaterial);
        this.lineMaterial.transparent = true;
        this.lineMaterial.opacity = 0;
        this.add(this.line);
    }

    // returns normalized vector
    // centered to quad
    getNormal(): Vector3 {
        //reset normals
        this.side0.setScalar(0);
        this.side1.setScalar(0);
        this.norm.setScalar(1); // may not need

        // calc 2 quad side sides
        this.side0.subVectors(this.v1, this.v0);
        this.side1.subVectors(this.v3, this.v0);

        // calc normal
        this.norm.crossVectors(this.side0, this.side1)
        this.norm.normalize().multiplyScalar(-.07);
        this.norm.add(this.getCentroid());

        //return quad normalized normal
        return this.norm;
    }

    setIsNormalVisible(isNormalVisible: boolean, normalAlpha: number = .25): void {
        this.isNormalVisible = isNormalVisible;
        this.normalAlpha = normalAlpha;
    }

    // dynamically recalculates normal
    updateNormal(): void {
        if (this.isNormalVisible) {
            this.lineMaterial.opacity = this.normalAlpha;
        } else {
            this.lineMaterial.opacity = 0;
        }
        this.lineMaterial.needsUpdate = true;

        this.lineGeometry.vertices = [];
        this.lineGeometry.vertices.push(this.getCentroid());
        this.lineGeometry.vertices.push(this.getNormal());

        this.lineGeometry.verticesNeedUpdate = true;

    }

    // returns center point
    getCentroid(): Vector3 {
        this.cntr.setScalar(0);
        this.cntr.add(this.v0);
        this.cntr.add(this.v1);
        this.cntr.add(this.v2);
        this.cntr.add(this.v3);
        this.cntr.divideScalar(4);
        return this.cntr;
    }
}
// end quad class
