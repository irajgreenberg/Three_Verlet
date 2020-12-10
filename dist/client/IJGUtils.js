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
// Organism propulsion
export class Propulsion {
    constructor(direction = new THREE.Vector3(0, 1, 0), force = new THREE.Vector3(0, 0, 0), frequency = new THREE.Vector3(0, 0, 0)) {
        this.direction = direction;
        this.force = force;
        this.frequency = frequency;
    }
}
