// Verlet Plane
// Composed of Verlet Sticks and Nodes

// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------

import * as THREE from '/build/three.module.js';
import { VerletNode } from './VerletNode.js';
import { BufferGeometry, Group, Mesh, NoColors, Texture, Triangle, Vector3 } from '/build/three.module.js';
import { VerletStick } from './VerletStick.js';
import { AnchorPlane, AnchorPoint, AxesPlane } from './IJGUtils.js';
import { isInterfaceDeclaration } from 'typescript';
import { CLIENT_RENEG_LIMIT } from 'tls';

// Convenience class to group 4 vectors
// includes quad centroid and normal
// question: should it handle its own drawing
// or just return stuff
export class Quad {
    v0: Vector3;
    v1: Vector3;
    v2: Vector3;
    v3: Vector3;

    // used internally for normal calucations
    private side0: Vector3 = new Vector3();
    private side1: Vector3 = new Vector3();
    private norm: Vector3 = new Vector3();

    // for centroid
    private cntr: Vector3 = new Vector3();

    constructor(v0: Vector3, v1: Vector3, v2: Vector3, v3: Vector3) {
        this.v0 = v0;
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
    }

    // returns normalized vector
    // centered to quad
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
        this.norm.normalize();
        this.norm.add(this.getCentroid());
        // return quad normalized normal
        return this.norm;
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
}
// end quad class



export class VerletPlane extends Group {

    width: number;
    height: number;
    widthSegs: number;
    heightSegs: number;
    diffuseImage: Texture;
    anchor: AnchorPlane;
    elasticity: number;
    axesPlane: AxesPlane;

    bodyNodes: VerletNode[] = []; // no edge nodes

    //internals
    // note: definite assignment assertion operator
    vertices!: Float32Array;
    geometry!: BufferGeometry;

    nodes2D: VerletNode[][] = [[]];
    nodes1D: VerletNode[] = []; // for convenience
    sticks: VerletStick[] = [];

    // for convenience
    rowSticks: VerletStick[] = [];
    colSticks: VerletStick[] = [];

    // used to attach structures to surface 
    // and dynamically determine plane angle
    // using normal calculation
    quads: Quad[] = [];

    // for conveninece: pushing plane middle node
    middleNodeIndex: number = 0;

    constructor(width: number, height: number, widthSegs: number, heightSegs: number, diffuseImage: Texture, anchor: AnchorPlane = AnchorPlane.NONE, elasticity: number = .5, axisPlane: AxesPlane = AxesPlane.ZX_AXIS) {
        super();
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

    private _init(): void {
        // calc VerletNodes
        const segW = this.width / this.widthSegs;
        const segH = this.height / this.heightSegs;
        const vertVals: number[] = [];

        let x = 0;
        let y = 0;
        let z = 0;
        for (var i = 0; i <= this.widthSegs; i++) {
            let v1D: VerletNode[] = [];
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
                v.setNodeColor(new THREE.Color(.2, .05, .4));
                //populate nodes array
                this.nodes2D[i].push(v);
                this.nodes1D.push(v);

                // fill bodyNodes array.
                // used for perturbing surface
                // while avoiding edges
                if (i > 0 && i < this.widthSegs - 1 &&
                    j > 0 && j < this.heightSegs - 1) {
                    this.bodyNodes.push(v);
                }

                //fill quads to align objects to surface
                // filled CCW
                if (i > 0 && j > 0) {
                    this.quads.push(new Quad(
                        this.nodes2D[i][j].position,
                        this.nodes2D[i][j - 1].position,
                        this.nodes2D[i - 1][j - 1].position,
                        this.nodes2D[i - 1][j].position,
                    ));
                }

                // add to scenegraph for drawing
                this.add(v);
            }
        }

        // intialize now we know length of arrays
        this.middleNodeIndex = Math.round(((this.nodes2D.length - 1) * (this.nodes2D[0].length - 1)) / 2 + (this.nodes2D.length - 1) / 2);

        // calc VerletSticks
        let vs: VerletStick;

        for (var i = 0; i < this.nodes2D.length; i++) {
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
                } else {
                    // connects right along last row
                    if (i < this.nodes2D.length - 2) {
                        vs = new VerletStick(this.nodes2D[i][j], this.nodes2D[i + 1][j]);
                        this.sticks.push(vs);
                        this.add(vs);

                        this.rowSticks.push(vs);
                    }

                }

            }
        }
    }

    // move indivisual node
    moveNode(node: VerletNode, vec: Vector3) {
        node.position.x += vec.x;
        node.position.y += vec.y;
        node.position.z += vec.z;
    }

    // move array of nodes
    moveNodes(indices: number[], vecs: Vector3[]) {
        for (var i = 0; i < indices.length; i++) {
            this.nodes1D[indices[i]].position.x += vecs[i].x;
            this.nodes1D[indices[i]].position.y += vecs[i].y;
            this.nodes1D[indices[i]].position.z += vecs[i].z;
        }
    }

    verlet(): void {
        for (var i = 0; i < this.nodes1D.length; i++) {
            this.nodes1D[i].verlet();
            this.nodes1D[i].setNodeColor(new THREE.Color(
                this.nodes1D[i].position.y * 2,
                .1 + this.nodes1D[i].position.y,
                .3 + this.nodes1D[i].position.y * 4));
        }
    }

    constrain(bounds: Vector3, offset: Vector3 = new Vector3()): void {
        for (var s of this.sticks) {
            s.constrainLen();
        }

        for (var i = 0; i < this.nodes1D.length; i++) {
            let v = new Vector3(bounds.x + offset.x, bounds.y + offset.y, bounds.z + offset.z);
            this.nodes1D[i].constrainBounds(v);
        }

    }

    // Lock select nodes
    setNodesOff(nodesOff: AnchorPlane) {
        switch (nodesOff) {
            case AnchorPlane.CORNER_ALL:
                for (let i = 0; i < this.nodes2D.length; i++) {
                    for (let j = 0; j < this.nodes2D[i].length; j++) {
                        // TURN OFF NODES
                        //top left corner
                        if (i == 0 && j == 0) {
                            this.nodes2D[i][j].isVerletable = false;
                        } else if (i == 0 && j == this.nodes2D[i].length - 1) {
                            this.nodes2D[i][j].isVerletable = false;
                        } else if (i == this.nodes2D.length - 2 && j == 0) {
                            this.nodes2D[i][j].isVerletable = false;
                        } else if (i == this.nodes2D.length - 2 && j == this.nodes2D[i].length - 1) {
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

            case AnchorPlane.EDGE_TOP:
                for (let i = 0; i < this.rowSticks.length; i += this.heightSegs + 1) {
                    //  this.rowSticks[i].lineMaterial.opacity = 0;
                    this.rowSticks[i].anchorTerminal = 2;
                }
                for (let i = 0; i < this.colSticks.length; i += this.heightSegs) {
                    // this.colSticks[i].lineMaterial.opacity = 0;
                    this.colSticks[i].anchorTerminal = 1;
                }
                break;

            case AnchorPlane.EDGE_RIGHT:
                for (let i = (this.heightSegs + 1) * (this.widthSegs - 1); i < this.rowSticks.length; i++) {
                    // this.rowSticks[i].lineMaterial.opacity = 0;
                    this.rowSticks[i].anchorTerminal = 2;
                }

                //console.log(this.heightSegs);
                for (let i = this.widthSegs * this.heightSegs; i < this.colSticks.length; i++) {
                    // this.colSticks[i].lineMaterial.opacity = 0;
                    this.colSticks[i].anchorTerminal = 1;
                }
                break;

            case AnchorPlane.EDGE_BOTTOM:
                for (let i = this.heightSegs; i < this.rowSticks.length; i += this.heightSegs + 1) {
                    //this.rowSticks[i].lineMaterial.opacity = 0;
                    this.rowSticks[i].anchorTerminal = 1;
                }
                for (let i = this.heightSegs - 1; i < this.colSticks.length; i += this.heightSegs) {
                    //this.colSticks[i].lineMaterial.opacity = 0;
                    this.colSticks[i].anchorTerminal = 2;
                }
                break;

            case AnchorPlane.EDGE_LEFT:
                for (let i = 0; i < this.heightSegs + 1; i++) {
                    // this.rowSticks[i].lineMaterial.opacity = 0;
                    this.rowSticks[i].anchorTerminal = 1;
                }
                for (let i = 0; i < this.heightSegs; i++) {
                    //  this.colSticks[i].lineMaterial.opacity = 0;
                    this.colSticks[i].anchorTerminal = 2;
                }
                break;

            case AnchorPlane.EDGES_ALL:
                //top edge
                for (let i = 0; i < this.rowSticks.length; i += this.heightSegs + 1) {
                    //  this.rowSticks[i].lineMaterial.opacity = 0;
                    this.rowSticks[i].anchorTerminal = 2;
                }
                for (let i = 0; i < this.colSticks.length; i += this.heightSegs) {
                    // this.colSticks[i].lineMaterial.opacity = 0;
                    this.colSticks[i].anchorTerminal = 1;
                }

                //right edge
                for (let i = (this.heightSegs + 1) * (this.widthSegs - 1); i < this.rowSticks.length; i++) {
                    // this.rowSticks[i].lineMaterial.opacity = 0;
                    this.rowSticks[i].anchorTerminal = 2;
                }

                //console.log(this.heightSegs);
                for (let i = this.widthSegs * this.heightSegs; i < this.colSticks.length; i++) {
                    // this.colSticks[i].lineMaterial.opacity = 0;
                    this.colSticks[i].anchorTerminal = 1;
                }

                //bottom edge
                for (let i = this.heightSegs; i < this.rowSticks.length; i += this.heightSegs + 1) {
                    //this.rowSticks[i].lineMaterial.opacity = 0;
                    this.rowSticks[i].anchorTerminal = 1;
                }
                for (let i = this.heightSegs - 1; i < this.colSticks.length; i += this.heightSegs) {
                    //this.colSticks[i].lineMaterial.opacity = 0;
                    this.colSticks[i].anchorTerminal = 2;
                }

                //left edge
                for (let i = 0; i < this.heightSegs + 1; i++) {
                    // this.rowSticks[i].lineMaterial.opacity = 0;
                    this.rowSticks[i].anchorTerminal = 1;
                }
                for (let i = 0; i < this.heightSegs; i++) {
                    //  this.colSticks[i].lineMaterial.opacity = 0;
                    this.colSticks[i].anchorTerminal = 2;
                }
                break;

        }

    }

}
