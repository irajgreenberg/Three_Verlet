// Verlet Plane
// Composed of Verlet Sticks and Nodes
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------
import * as THREE from '/build/three.module.js';
import { VerletNode } from './VerletNode.js';
import { BufferGeometry, Vector3 } from '/build/three.module.js';
import { AnchorPlane } from './IJGUtils.js';
export class EulerNode extends BufferGeometry {
    //geometry: BufferGeometry;
    constructor(width, height, widthSegs, heightSegs, diffuseImage, anchor = AnchorPlane.NONE, elasticity = .5) {
        super();
        this.nodes = [];
        this.sticks = [];
        this.tris = [];
        this.width = width;
        this.height = height;
        this.widthSegs = widthSegs;
        this.heightSegs = heightSegs;
        this.diffuseImage = diffuseImage;
        this.anchor = anchor;
        this.elasticity = elasticity;
        this._init();
    }
    _init() {
        // calc vertices
        const segW = this.width / this.widthSegs;
        const segH = this.height / this.heightSegs;
        const vertVals = [];
        for (var i = 0; i <= this.widthSegs; i++) {
            for (var j = 0; j <= this.heightSegs; j++) {
                const x = segW * i;
                const y = segH * j;
                const z = 0;
                vertVals.push(x);
                vertVals.push(y);
                vertVals.push(z);
                this.nodes.push(new VerletNode(new Vector3()));
            }
        }
        this.vertices = new Float32Array(vertVals);
        this.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3));
    }
}
