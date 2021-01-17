// Verlet Plane
// Composed of Verlet Sticks and Nodes
import { VerletNode } from './VerletNode.js';
import { Group, Vector3 } from '/build/three.module.js';
import { VerletStick } from './VerletStick.js';
import { AnchorPlane } from './IJGUtils.js';
export class VerletPlane extends Group {
    constructor(width, height, widthSegs, heightSegs, diffuseImage, anchor = AnchorPlane.NONE, elasticity = .5) {
        super();
        this.nodes2D = [[]];
        this.nodes1D = []; // for convenience
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
        // calc VerletNodes
        const segW = this.width / this.widthSegs;
        const segH = this.height / this.heightSegs;
        const vertVals = [];
        for (var i = 0; i <= this.widthSegs; i++) {
            let v1D = [];
            this.nodes2D.push(v1D);
            for (var j = 0; j <= this.heightSegs; j++) {
                const x = -this.width / 2 + segW * i;
                const y = this.height / 2 - segH * j;
                const z = 0;
                vertVals.push(x);
                vertVals.push(y);
                vertVals.push(z);
                let v = new VerletNode(new Vector3(x, y, z));
                //populate nodes array
                this.nodes2D[i].push(v);
                this.nodes1D.push(this.nodes2D[i][j]);
                // add to scenegraph for drawing
                this.add(this.nodes2D[i][j]);
            }
        }
        // calc VerletSticks
        let vs;
        for (var i = 0, k = 0; i < this.nodes2D.length; i++) {
            for (var j = 0; j < this.nodes2D[i].length; j++) {
                if (j < this.nodes2D[i].length - 1) {
                    vs = new VerletStick(this.nodes2D[i][j], this.nodes2D[i][j + 1]);
                    this.sticks.push(vs);
                    this.add(this.sticks[k]);
                    k++;
                    if (i < this.nodes2D.length - 2) {
                        vs = new VerletStick(this.nodes2D[i][j], this.nodes2D[i + 1][j]);
                        //this.add(vs);
                        this.sticks.push(vs);
                        this.add(this.sticks[k]);
                        k++;
                    }
                }
                else {
                    if (i < this.nodes2D.length - 2) {
                        vs = new VerletStick(this.nodes2D[i][j], this.nodes2D[i + 1][j]);
                        //this.add(vs);
                        this.sticks.push(vs);
                        this.add(this.sticks[k]);
                        k++;
                    }
                }
            }
        }
        // calc constraints (eventually maybe do in loops above)
        //for (var i = 0; i < this.sticks.length; i++) {
        switch (this.anchor) {
            case AnchorPlane.CORNER_ALL:
                this.sticks[0].anchorTerminal = 3;
                this.sticks[this.sticks.length - 1].anchorTerminal = 3;
                break;
            default:
                this.anchor = AnchorPlane.NONE;
        }
        //}
        // create buffered geometry
        // this.vertices = new Float32Array(vertVals);
        // this.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3));
    }
    // start verlet offeset
    push(indices, vec) {
        for (var i = 0; i < indices.length; i++) {
            this.nodes1D[indices[i]].position.x += vec.x; //THREE.MathUtils.randFloatSpread(vec.x);
            this.nodes1D[indices[i]].position.y += vec.y;
            this.nodes1D[indices[i]].position.z += vec.z;
        }
    }
    verlet() {
        for (var i = 0; i < this.nodes1D.length; i++) {
            this.nodes1D[i].verlet();
        }
    }
    constrain(bounds, offset = new Vector3()) {
        for (var s of this.sticks) {
            s.constrainLen();
        }
        for (var i = 0; i < this.nodes1D.length; i++) {
            let v = new Vector3(bounds.x + offset.x, bounds.y + offset.y, bounds.z + offset.z);
            this.nodes1D[i].constrainBounds(v);
        }
    }
}
