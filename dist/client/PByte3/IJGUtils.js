//import { Vector3, Color} from 'three';
import { Vector3, Color } from '/build/three.module.js';
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
    AnchorPlane[AnchorPlane["EDGE_LEFT"] = 8] = "EDGE_LEFT";
    AnchorPlane[AnchorPlane["EDGE_RIGHT"] = 9] = "EDGE_RIGHT";
    AnchorPlane[AnchorPlane["EDGE_TOP"] = 10] = "EDGE_TOP";
    AnchorPlane[AnchorPlane["EDGE_BOTTOM"] = 11] = "EDGE_BOTTOM";
    AnchorPlane[AnchorPlane["RAND_VERT"] = 12] = "RAND_VERT";
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
