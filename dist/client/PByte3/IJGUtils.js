import { Color, Geometry, Group, Line, LineBasicMaterial, Mesh, MeshPhongMaterial, SphereGeometry, Vector3 } from '/build/three.module.js';
// Verlet stick terminal anchoring
export var AnchorPoint;
(function (AnchorPoint) {
    AnchorPoint[AnchorPoint["NONE"] = 0] = "NONE";
    AnchorPoint[AnchorPoint["HEAD"] = 1] = "HEAD";
    AnchorPoint[AnchorPoint["TAIL"] = 2] = "TAIL";
    AnchorPoint[AnchorPoint["HEAD_TAIL"] = 3] = "HEAD_TAIL";
    AnchorPoint[AnchorPoint["MOD2"] = 4] = "MOD2";
    AnchorPoint[AnchorPoint["RAND"] = 5] = "RAND";
})(AnchorPoint || (AnchorPoint = {}));
// Axes for drawing plane
export var AxesPlane;
(function (AxesPlane) {
    AxesPlane[AxesPlane["XY_AXIS"] = 0] = "XY_AXIS";
    AxesPlane[AxesPlane["YZ_AXIS"] = 1] = "YZ_AXIS";
    AxesPlane[AxesPlane["ZX_AXIS"] = 2] = "ZX_AXIS";
})(AxesPlane || (AxesPlane = {}));
// Verlet plane edge/corner anchoring
export var AnchorPlane;
(function (AnchorPlane) {
    AnchorPlane[AnchorPlane["NONE"] = 0] = "NONE";
    AnchorPlane[AnchorPlane["CORNER_ALL"] = 1] = "CORNER_ALL";
    AnchorPlane[AnchorPlane["CORNER_0"] = 2] = "CORNER_0";
    AnchorPlane[AnchorPlane["CORNER_1"] = 3] = "CORNER_1";
    AnchorPlane[AnchorPlane["CORNER_2"] = 4] = "CORNER_2";
    AnchorPlane[AnchorPlane["CORNER_3"] = 5] = "CORNER_3";
    AnchorPlane[AnchorPlane["CORNER_02"] = 6] = "CORNER_02";
    AnchorPlane[AnchorPlane["CORNER_13"] = 7] = "CORNER_13";
    AnchorPlane[AnchorPlane["EDGES_ALL"] = 8] = "EDGES_ALL";
    AnchorPlane[AnchorPlane["EDGE_LEFT"] = 9] = "EDGE_LEFT";
    AnchorPlane[AnchorPlane["EDGE_RIGHT"] = 10] = "EDGE_RIGHT";
    AnchorPlane[AnchorPlane["EDGE_TOP"] = 11] = "EDGE_TOP";
    AnchorPlane[AnchorPlane["EDGE_BOTTOM"] = 12] = "EDGE_BOTTOM";
    AnchorPlane[AnchorPlane["RAND_VERT"] = 13] = "RAND_VERT";
})(AnchorPlane || (AnchorPlane = {}));
// Verlet stick terminal anchoring
export var GeometryDetail;
(function (GeometryDetail) {
    GeometryDetail[GeometryDetail["TRI"] = 3] = "TRI";
    GeometryDetail[GeometryDetail["QUAD"] = 4] = "QUAD";
    GeometryDetail[GeometryDetail["PENT"] = 5] = "PENT";
    GeometryDetail[GeometryDetail["HEX"] = 6] = "HEX";
    GeometryDetail[GeometryDetail["HEP"] = 7] = "HEP";
    GeometryDetail[GeometryDetail["OCT"] = 8] = "OCT";
    GeometryDetail[GeometryDetail["DEC"] = 10] = "DEC";
    GeometryDetail[GeometryDetail["DODEC"] = 12] = "DODEC";
    GeometryDetail[GeometryDetail["TETRA"] = 13] = "TETRA";
    GeometryDetail[GeometryDetail["CUBE"] = 14] = "CUBE";
    GeometryDetail[GeometryDetail["OCTA"] = 15] = "OCTA";
    GeometryDetail[GeometryDetail["ICOSA"] = 16] = "ICOSA";
    GeometryDetail[GeometryDetail["DODECA"] = 17] = "DODECA";
    GeometryDetail[GeometryDetail["SPHERE_LOW"] = 18] = "SPHERE_LOW";
    GeometryDetail[GeometryDetail["SPHERE_MED"] = 19] = "SPHERE_MED";
    GeometryDetail[GeometryDetail["SPHERE_HIGH"] = 20] = "SPHERE_HIGH";
    GeometryDetail[GeometryDetail["SPHERE_SUPERHIGH"] = 21] = "SPHERE_SUPERHIGH";
    GeometryDetail[GeometryDetail["SPHERE_SUPERDUPERHIGH"] = 22] = "SPHERE_SUPERDUPERHIGH";
})(GeometryDetail || (GeometryDetail = {}));
// Organism propulsion
export class Propulsion {
    constructor(direction = new Vector3(0, 1, 0), force = new Vector3(0, 0, 0), frequency = new Vector3(0, 0, 0)) {
        this.direction = direction;
        this.force = force;
        this.frequency = frequency;
    }
}
// Organism Materials
export class VerletMaterials {
    constructor(spineNodeColor = new Color(.5, .5, .5), spineColor = new Color(.5, .5, .5), spineAlpha = .5, sliceColor = new Color(.5, .5, .5), sliceAlpha = .5, tendrilNodeColor = new Color(.5, .5, .5), tendrilColor = new Color(.5, .5, .5), tendrilAlpha = .5, ciliaNodeColor = new Color(.5, .5, .5), ciliaColor = new Color(.5, .5, .5), ciliaAlpha = .5) {
        this.spineNodeColor = new Color(.5, .5, .5);
        this.spineColor = new Color(.5, .5, .5);
        this.spineAlpha = 1.0;
        this.sliceColor = new Color(.5, .5, .5);
        this.sliceAlpha = 1.0;
        this.tendrilNodeColor = new Color(.5, .5, .5);
        this.tendrilColor = new Color(.5, .5, .5);
        this.tendrilAlpha = 1.0;
        this.ciliaNodeColor = new Color(.5, .5, .5);
        this.ciliaColor = new Color(.5, .5, .5);
        this.ciliaAlpha = 1.0;
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
    constructor(v0, v1, v2, v3) {
        super();
        // used internally for normal calucations
        this.side0 = new Vector3();
        this.side1 = new Vector3();
        this.norm = new Vector3();
        this.isNormalVisible = false;
        this.normalAlpha = 0;
        // for centroid
        this.cntr = new Vector3();
        this.lineGeometry = new Geometry();
        this.lineMaterial = new LineBasicMaterial({ color: 0xFF9900 });
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
    getNormal() {
        //reset normals
        this.side0.setScalar(0);
        this.side1.setScalar(0);
        this.norm.setScalar(1); // may not need
        // calc 2 quad side sides
        this.side0.subVectors(this.v1, this.v0);
        this.side1.subVectors(this.v3, this.v0);
        // calc normal
        this.norm.crossVectors(this.side0, this.side1);
        this.norm.normalize().multiplyScalar(-.07);
        this.norm.add(this.getCentroid());
        //return quad normalized normal
        return this.norm;
    }
    setIsNormalVisible(isNormalVisible, normalAlpha = .25) {
        this.isNormalVisible = isNormalVisible;
        this.normalAlpha = normalAlpha;
    }
    // dynamically recalculates normal
    updateNormal() {
        if (this.isNormalVisible) {
            this.lineMaterial.opacity = this.normalAlpha;
        }
        else {
            this.lineMaterial.opacity = 0;
        }
        this.lineMaterial.needsUpdate = true;
        this.lineGeometry.vertices = [];
        this.lineGeometry.vertices.push(this.getCentroid());
        this.lineGeometry.vertices.push(this.getNormal());
        this.lineGeometry.verticesNeedUpdate = true;
    }
    // returns center point
    getCentroid() {
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
// BEGIN Orb class
export class Orb extends Group {
    constructor(radius, pos, speed, color) {
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
    collide(responseVector) {
    }
}
// END Orb class
//global variables
//global variable - eventually implement 'more better'.
export class PByteGLobals {
}
PByteGLobals.gravity = 0;
;
