
import {
    Color, BufferGeometry, Group, Line, LineBasicMaterial,
    Mesh, MeshPhongMaterial, SphereGeometry, Vector3
} from 'three';

// Hair Density
// custom needs to be explicitly set
export enum HairDensity {
    BALDING = 0,
    LIGHT = 1,
    MEDIUM = 2,
    HEAVY = 3,
    BIG_FOOT = 4,
    CUSTOM = -1
}

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

// Convenience class to group 3 vectors
// includes tri centroid and normal
export class Tri extends Group {
    v0: Vector3;
    v1: Vector3;
    v2: Vector3;
    isDrawable: boolean;

    // used internally for normal calucations
    private side0: Vector3 = new Vector3();
    private side1: Vector3 = new Vector3();
    private norm: Vector3 = new Vector3();

    private isNormalVisible: boolean = false;
    private normalAlpha: number = 0;

    // for centroid
    private cntr: Vector3 = new Vector3();

    lineGeometry: BufferGeometry;
    lineMaterial = new LineBasicMaterial({ color: 0xFF9900 });
    line: Line;

    constructor(v0: Vector3, v1: Vector3, v2: Vector3, isDrawable: boolean = true) {
        super();
        this.v0 = v0;
        this.v1 = v1;
        this.v2 = v2;
        this.isDrawable = isDrawable;

        // for drawing normal
        let points = [];
        points.push(this.getCentroid());
        points.push(this.getNormal());
        this.lineGeometry = new BufferGeometry().setFromPoints(points);

        this.line = new Line(this.lineGeometry, this.lineMaterial);
        this.lineMaterial.transparent = true;
        this.lineMaterial.opacity = 0;
        if (isDrawable) {
            this.add(this.line);
        }
    }

    // returns normalized vector
    // centered to face
    getNormal(): Vector3 {
        //reset normals
        this.side0.setScalar(0);
        this.side1.setScalar(0);
        this.norm.setScalar(1); // may not need

        // calc 2 quad side sides
        this.side0.subVectors(this.v1, this.v0);
        this.side1.subVectors(this.v2, this.v0);

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

        // this.lineGeometry.vertices = [];
        // this.lineGeometry.vertices.push(this.getCentroid());
        // this.lineGeometry.vertices.push(this.getNormal());

        // this.lineGeometry.verticesNeedUpdate = true;
        (this.lineGeometry as THREE.BufferGeometry).attributes.position.needsUpdate = true

    }

    // returns center point
    getCentroid(): Vector3 {
        this.cntr.setScalar(0);
        this.cntr.add(this.v0);
        this.cntr.add(this.v1);
        this.cntr.add(this.v2);
        this.cntr.divideScalar(3);
        return this.cntr;
    }

    getEdges(): Vector3[] {
        let edges = [new Vector3(), new Vector3(),
        new Vector3(), new Vector3()];
        edges[0].subVectors(this.v1, this.v0);
        edges[1].subVectors(this.v2, this.v1);
        edges[2].subVectors(this.v0, this.v2);
        return edges;
    }

    getArea(): number {
        // returns magnitude of cross product
        let c = new Vector3();
        c.copy(this.getEdges()[0]);
        c.cross(this.getEdges()[1]);
        return c.length();
    }
}
// end tri class

// Convenience class to group 4 vectors
// includes quad centroid and normal
export class Quad extends Group {
    v0: Vector3;
    v1: Vector3;
    v2: Vector3;
    v3: Vector3;
    isDrawable: boolean;

    // used internally for normal calculations
    private side0: Vector3 = new Vector3();
    private side1: Vector3 = new Vector3();
    private norm: Vector3 = new Vector3();

    private isNormalVisible: boolean = false;
    private normalAlpha: number = 0;

    // for centroid
    private cntr: Vector3 = new Vector3();

    lineGeometry: BufferGeometry;
    lineMaterial = new LineBasicMaterial({ color: 0xFF9900 });
    line: Line;

    constructor(v0: Vector3, v1: Vector3, v2: Vector3, v3: Vector3, isDrawable: boolean = true) {
        super();
        this.v0 = v0;
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
        this.isDrawable = isDrawable;

        let points = [];
        points.push(this.getCentroid());
        points.push(this.getNormal());
        this.lineGeometry = new BufferGeometry().setFromPoints(points);

        this.line = new Line(this.lineGeometry, this.lineMaterial);
        this.lineMaterial.transparent = true;
        this.lineMaterial.opacity = 0;
        if (isDrawable) {
            this.add(this.line);
        }
    }

    // returns normalized vector
    // centered to face
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

        // this.lineGeometry.vertices = [];
        // this.lineGeometry.vertices.push(this.getCentroid());
        // this.lineGeometry.vertices.push(this.getNormal());

        // this.lineGeometry.verticesNeedUpdate = true;
        (this.lineGeometry as THREE.BufferGeometry).attributes.position.needsUpdate = true

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

    getEdges(): Vector3[] {
        let edges = [new Vector3(), new Vector3(),
        new Vector3(), new Vector3()];
        edges[0].subVectors(this.v1, this.v0);
        edges[1].subVectors(this.v2, this.v1);
        edges[2].subVectors(this.v3, this.v2);
        edges[3].subVectors(this.v0, this.v3);
        return edges;
    }

    getArea(): number {
        // returns magnitude of cross product
        let c = new Vector3();
        c.copy(this.getEdges()[0]);
        c.cross(this.getEdges()[1]);
        return c.length();
    }
}
// end quad class


// BEGIN Orb class
export class Orb extends Group {
    radius: number;
    pos: Vector3;
    speed: Vector3;
    color: Color;
    sphere: Mesh;

    constructor(radius: number, pos: Vector3, speed: Vector3, color: Color) {
        super();
        this.radius = radius;
        this.pos = pos;
        this.speed = speed;
        this.color = color;

        const geometry = new SphereGeometry(this.radius, 6, 6);
        const material = new MeshPhongMaterial({ color: this.color });
        this.sphere = new Mesh(geometry, material);
        this.sphere.position.x = pos.x;
        this.sphere.position.y = pos.y;
        this.sphere.position.z = pos.z;
        this.add(this.sphere);
    }

    move() {
        this.speed.y += PByteGLobals.gravity;
        this.pos.add(this.speed);
        this.sphere.position.x = this.pos.x;
        this.sphere.position.y = this.pos.y;
        this.sphere.position.z = this.pos.z;
    }

    collide(responseVector: number) {

    }
}
// END Orb class

//global variables
//global variable - eventually implement 'more better'.
export class PByteGLobals {
    static gravity: number = 0;
};


