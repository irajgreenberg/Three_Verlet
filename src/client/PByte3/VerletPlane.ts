// Verlet Plane
// Composed of Verlet Sticks and Nodes

// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------

import * as THREE from 'three';
import { VerletNode } from './VerletNode';
import { BufferGeometry, Group, Texture, Vector3 } from 'three';
import { VerletStick } from './VerletStick';
import { AnchorPlane, AxesPlane, Orb, Quad } from './IJGUtils';


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

        //add quads
        for (let q of this.quads) {
            this.add(q);
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

    // Checks each quad against each orb
    // determining surface deformation response 
    // and orb rebounding.
    // 1. detect collision w quad
    // 2. calculate 'accurate' response of orb and
    // 3. surface w conservation of momentum
    checkCollisions(orb: Orb) {
        /*if (p.norm().dot(r) < 0) {
        pt.spd.mult(0);
        }*/

        for (let q of this.quads) {
            // simple orthogonal collision test
            // if (orb.pos.y < q.getCentroid().y) {
            //     orb.pos.y = q.getCentroid().y
            //     console.log("centroid.y = ", q.getCentroid().y);
            //     orb.speed.y *= -1;
            // }

            // Initial collision check for orb against planes
            //if (q.getNormal().dot(orb.pos) < 0) {
            let plane_orb_area = 0;
            // Calculate combined area 
            // of 4 triangles using
            // A: quad edge
            // B: orb.pos
            // Area of each triangle: 
            // 1/2 mag A X B 
            for (let i = 0; i < 4; i++) {
                let quadEdge = new Vector3();
                quadEdge.copy(q.getEdges()[i]);
                quadEdge.cross(orb.pos);
                plane_orb_area += quadEdge.length() / 2;
            }
            //console.log((plane_orb_area - q.getArea());
            if (Math.abs(plane_orb_area - q.getArea()) < .04) {
                console.log("plane_orb_area = ", plane_orb_area);
                console.log("q.getArea() = ", q.getArea());
                orb.speed.y *= -1;
            }
            // Check against indivisual quads

            //  q.
            // orb.speed.y *= -1;
            //}
        }

    }



    showNormals() {
        for (var i = 0; i < this.quads.length; i++) {
            this.quads[i].updateNormal();
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

    setNormalsVisible(isNormalVisible: boolean, normalAlpha: number = .25): void {
        for (let q of this.quads) {
            q.setIsNormalVisible(isNormalVisible, normalAlpha);
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
