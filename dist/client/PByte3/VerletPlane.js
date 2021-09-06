// Verlet Plane
// Composed of Verlet Sticks and Nodes
import { VerletNode } from './VerletNode.js';
import { Group, Vector3 } from '/build/three.module.js';
import { VerletStick } from './VerletStick.js';
import { AnchorPlane, AxesPlane } from './IJGUtils.js';
export class VerletPlane extends Group {
    constructor(width, height, widthSegs, heightSegs, diffuseImage, anchor = AnchorPlane.NONE, elasticity = .5, axisPlane = AxesPlane.ZX_AXIS) {
        super();
        this.nodes2D = [[]];
        this.nodes1D = []; // for convenience
        this.sticks = [];
        // for convenience
        this.rowSticks = [];
        this.colSticks = [];
        this.tris = [];
        // for conveninece: pushing plane middle node
        this.middleNodeIndex = 0;
        this.width = width;
        this.height = height;
        this.widthSegs = widthSegs;
        this.heightSegs = heightSegs;
        this.diffuseImage = diffuseImage;
        this.anchor = anchor;
        this.elasticity = elasticity;
        this.axesPlane = axisPlane;
        this._init();
    }
    _init() {
        // calc VerletNodes
        const segW = this.width / this.widthSegs;
        const segH = this.height / this.heightSegs;
        const vertVals = [];
        let x = 0;
        let y = 0;
        let z = 0;
        for (var i = 0; i <= this.widthSegs; i++) {
            let v1D = [];
            this.nodes2D.push(v1D);
            for (var j = 0; j <= this.heightSegs; j++) {
                //determine plane axes
                switch (this.axesPlane) {
                    case AxesPlane.XY_AXIS:
                        x = -this.width / 2 + segW * i;
                        y = this.height / 2 - segH * j;
                        z = 0;
                        break;
                    case AxesPlane.YZ_AXIS:
                        x = 0;
                        y = -this.width / 2 + segW * i;
                        z = this.height / 2 - segH * j;
                        break;
                    case AxesPlane.ZX_AXIS:
                        x = -this.width / 2 + segW * i;
                        y = 0;
                        z = this.height / 2 - segH * j;
                        break;
                }
                vertVals.push(x);
                vertVals.push(y);
                vertVals.push(z);
                let v = new VerletNode(new Vector3(x, y, z));
                //populate nodes array
                this.nodes2D[i].push(v);
                this.nodes1D.push(v);
                // add to scenegraph for drawing
                this.add(v);
            }
        }
        // intialize now we know length of arrays
        this.middleNodeIndex = Math.round(((this.nodes2D.length - 1) * (this.nodes2D[0].length - 1)) / 2 + (this.nodes2D.length - 1) / 2);
        // calc VerletSticks
        let vs;
        for (var i = 0; i < this.nodes2D.length; i++) {
            // let colSticks1D: VerletStick[] = [];
            // let rowSticks1D: VerletStick[] = [];
            for (var j = 0; j < this.nodes2D[i].length; j++) {
                // connects down along columns
                if (j < this.nodes2D[i].length - 1) {
                    vs = new VerletStick(this.nodes2D[i][j], this.nodes2D[i][j + 1]);
                    this.sticks.push(vs);
                    this.add(vs);
                    this.colSticks.push(vs);
                    // connects right along rows
                    if (i < this.nodes2D.length - 2) {
                        vs = new VerletStick(this.nodes2D[i][j], this.nodes2D[i + 1][j]);
                        this.sticks.push(vs);
                        this.add(vs);
                        this.rowSticks.push(vs);
                    }
                }
                else {
                    // connects right along last row
                    if (i < this.nodes2D.length - 2) {
                        vs = new VerletStick(this.nodes2D[i][j], this.nodes2D[i + 1][j]);
                        this.sticks.push(vs);
                        this.add(vs);
                        this.rowSticks.push(vs);
                    }
                }
            }
            // this.colSticks.push(colSticks1D);
            // this.rowSticks.push(rowSticks1D);
        }
        for (var i = 0; i < this.sticks.length; i++) {
            //    this.sticks[i].anchorTerminal = 3
        }
        // this.sticks[0].anchorTerminal = 3
        //  this.sticks[20].anchorTerminal = 3
        // this.sticks[6].visible = false;
        // calc constraints (eventually maybe do in loops above)
        //for (var i = 0; i < this.sticks.length; i++) {
        switch (this.anchor) {
            case AnchorPlane.CORNER_ALL:
                // TL corner
                // this.sticks[0].anchorTerminal = 1;
                //  this.sticks[this.widthSegs * this.heightSegs].anchorTerminal = 1;
                // this.sticks[this.sticks.length - 1].anchorTerminal = 3;
                break;
            default:
            //  this.anchor = AnchorPlane.NONE;
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
    // Lock select nodes
    setNodesOff(nodesOff) {
        switch (nodesOff) {
            case AnchorPlane.CORNER_ALL:
                for (let i = 0; i < this.nodes2D.length; i++) {
                    for (let j = 0; j < this.nodes2D[i].length; j++) {
                        // TURN OFF NODES
                        //top left corner
                        if (i == 0 && j == 0) {
                            this.nodes2D[i][j].isVerletable = false;
                        }
                        else if (i == 0 && j == this.nodes2D[i].length - 1) {
                            this.nodes2D[i][j].isVerletable = false;
                        }
                        else if (i == this.nodes2D.length - 2 && j == 0) {
                            this.nodes2D[i][j].isVerletable = false;
                        }
                        else if (i == this.nodes2D.length - 2 && j == this.nodes2D[i].length - 1) {
                            this.nodes2D[i][j].isVerletable = false;
                        }
                    }
                    //TURN OFF STICKS
                    // top left sticks
                    this.colSticks[0].anchorTerminal = 1;
                    this.rowSticks[0].anchorTerminal = 1;
                    // top right sticks
                    this.colSticks[this.heightSegs * this.widthSegs].anchorTerminal = 1;
                    this.rowSticks[this.rowSticks.length - 1 - this.heightSegs].anchorTerminal = 2;
                    // bottem left sticks
                    this.colSticks[this.heightSegs - 1].anchorTerminal = 2;
                    this.rowSticks[this.widthSegs].anchorTerminal = 1;
                    // bottem right sticks
                    this.colSticks[this.colSticks.length - 1].anchorTerminal = 2;
                    this.rowSticks[this.rowSticks.length - 1].anchorTerminal = 2;
                    // this.rowSticks[19].lineMaterial.opacity = 0;
                }
                break;
            case AnchorPlane.EDGES_ALL:
                //top edge
                for (let i = 0; i < this.rowSticks.length; i += this.heightSegs + 1) {
                    //  this.rowSticks[i].lineMaterial.opacity = 0;
                    this.rowSticks[i].anchorTerminal = 2;
                }
                for (let i = 0; i < this.colSticks.length; i += this.widthSegs) {
                    //   this.colSticks[i].lineMaterial.opacity = 0;
                    this.colSticks[i].anchorTerminal = 1;
                }
                break;
        }
    }
}
