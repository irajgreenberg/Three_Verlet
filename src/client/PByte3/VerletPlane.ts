// Verlet Plane
// Composed of Verlet Sticks and Nodes

// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------

import * as THREE from '/build/three.module.js';
import { VerletNode } from './VerletNode.js';
import { BufferGeometry, Mesh, NoColors, Texture, Triangle, Vector3 } from '/build/three.module.js';
import { VerletStick } from './VerletStick.js';
import { AnchorPlane } from './IJGUtils.js';
import { isInterfaceDeclaration } from 'typescript';
import { CLIENT_RENEG_LIMIT } from 'tls';

export class EulerNode extends BufferGeometry {

    width: number;
    height: number;
    widthSegs: number;
    heightSegs: number;
    diffuseImage: Texture;
    anchor: AnchorPlane;
    elasticity: number;

    //internals
    vertices: Float32Array;
    nodes: VerletNode[] = [];
    sticks: VerletStick[] = [];
    tris: Triangle[] = [];
    //geometry: BufferGeometry;


    constructor(width: number, height: number, widthSegs: number, heightSegs: number, diffuseImage: Texture, anchor: AnchorPlane = AnchorPlane.NONE, elasticity: number = .5) {
        super();
        this.width = width;
        this.height = height;
        this.widthSegs = widthSegs;
        this.heightSegs = heightSegs;
        this.diffuseImage = diffuseImage;
        this.anchor = anchor;
        this.elasticity = elasticity;

        this._init();
    }

    private _init(): void {
        // calc vertices
        const segW = this.width / this.widthSegs;
        const segH = this.height / this.heightSegs;
        const vertVals: number[] = [];
        for (var i = 0; i <= this.widthSegs; i++) {
            for (var j = 0; j <= this.heightSegs; j++) {
                const x = segW * i;
                const y = segH * j;
                const z = 0;
                vertVals.push(x);
                vertVals.push(y);
                vertVals.push(z);
                this.nodes.push(new VerletNode(new Vector3()))
            }
        }
        this.vertices = new Float32Array(vertVals);
        this.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3));
    }

}