import * as THREE from '/build/three.module.js';
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
    constructor(direction = new THREE.Vector3(0, 1, 0), force = new THREE.Vector3(0, 0, 0), frequency = new THREE.Vector3(0, 0, 0)) {
        this.direction = direction;
        this.force = force;
        this.frequency = frequency;
    }
}
// Organism Materials
export class VerletMaterials {
    constructor(nodeRadius = .001, nodeColor = new THREE.Color(.5, .5, .5), nodeAlpha = .5, spineColor = new THREE.Color(.5, .5, .5), spineAlpha = .5, sliceColor = new THREE.Color(.5, .5, .5), sliceAlpha = .5, tendrilColor = new THREE.Color(.5, .5, .5), tendrilAlpha = .5) {
        this.nodeRadius = .01;
        this.nodeColor = new THREE.Color(.5, .5, .5);
        this.nodeAlpha = 1.0;
        this.spineColor = new THREE.Color(.5, .5, .5);
        this.spineAlpha = 1.0;
        this.sliceColor = new THREE.Color(.5, .5, .5);
        this.sliceAlpha = 1.0;
        this.tendrilColor = new THREE.Color(.5, .5, .5);
        this.tendrilAlpha = 1.0;
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
