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
// Organism Materials
export class VerletMaterials {
    constructor(nodeRadius = .001, nodeColor = new THREE.Color(.5, .5, .5), nodeAlpha = .5, spineColor = new THREE.Color(.5, .5, .5), spineAlpha = .5, sliceColor = new THREE.Color(.5, .5, .5), sliceAlpha = .5) {
        this.nodeRadius = .01;
        this.nodeColor = new THREE.Color(.5, .5, .5);
        this.nodeAlpha = 1.0;
        this.spineColor = new THREE.Color(.5, .5, .5);
        this.spineAlpha = 1.0;
        this.sliceColor = new THREE.Color(.5, .5, .5);
        this.sliceAlpha = 1.0;
        this.nodeRadius = nodeRadius;
        this.nodeColor = nodeColor;
        this.nodeAlpha = nodeAlpha;
        this.spineColor = spineColor;
        this.spineAlpha = spineAlpha;
        this.sliceColor = sliceColor;
        this.sliceAlpha = sliceAlpha;
    }
}
