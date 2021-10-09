// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall

// Creates Verlet Tendrils - motion/springing based on displacement

import * as THREE from 'three';
import { VerletNode } from './VerletNode';
import { VerletStick } from './VerletStick';
import { AnchorPoint, GeometryDetail } from './IJGUtils';
import { BufferAttribute, BufferGeometry, Color, Group, Line, LineBasicMaterial, MathUtils, MeshBasicMaterial, Vector3 } from 'three';

export class VerletStrand extends Group {
    head: Vector3
    tail: Vector3
    segmentCount: number;
    segments: VerletStick[];
    nodes: VerletNode[];
    // controls anchor ponts along strand
    private anchorPointDetail: AnchorPoint;
    // controls spring tension between adjacent nodes
    elasticity: number;
    nodeType: GeometryDetail;
    areNodesVisible: boolean = true;

    tendrilGeometry: BufferGeometry;
    material = new MeshBasicMaterial({ color: 0xffffff, });
    public tendril: Line;

    // used to cheaply rotate nodes around their local axis
    // should eventually be set as a per node property
    testRot = 0;

    constructor(head: Vector3, tail: Vector3, segmentCount: number,
        anchorPointDetail: AnchorPoint = AnchorPoint.NONE, elasticity: number = .1,
        nodeType: GeometryDetail = GeometryDetail.SPHERE_LOW, nodeRadius: number = MathUtils.randFloat(.0002, .0007)) {
        super();
        this.head = head;
        this.tail = tail;
        this.segmentCount = segmentCount;
        this.segments = new Array(segmentCount);
        this.nodes = new Array(segmentCount + 1);
        this.anchorPointDetail = anchorPointDetail;
        this.elasticity = elasticity;
        this.nodeType = nodeType;
        // encapsulaes stick data
        this.tendril = new Line();

        // local vars for segment calcuations
        let deltaVec = new Vector3();
        // get chain vector
        deltaVec.subVectors(this.head, this.tail);
        let chainLen = deltaVec.length();
        // get chain segment length
        let segLen = chainLen / this.segments.length;
        deltaVec.normalize();
        deltaVec.multiplyScalar(segLen);
        // console.log(deltaVec);
        for (var i = 0; i < this.nodes.length; i++) {
            // working, but copies values - so lose reference to node object pesition in memory
            this.nodes[i] = new VerletNode(new Vector3(
                this.head.x + deltaVec.x * i,
                this.head.y + deltaVec.y * i,
                this.head.z + deltaVec.z * i
            ),
                MathUtils.randFloat(.0002, .0007),
                new Color(1, 1, 1), this.nodeType);

            this.nodes[i].setNodeVisible(true);
            this.nodes[i].setNodeAlpha(.6);

            // show nodes
            this.add(this.nodes[i]);
        }

        // add constraints
        switch (this.anchorPointDetail) {
            case AnchorPoint.NONE:
                for (var i = 0; i < this.segments.length; i++) {
                    this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                }
                break;
            case AnchorPoint.HEAD:
                for (var i = 0; i < this.segments.length; i++) {
                    if (i === 0) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.HEAD);
                    } else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    }
                }
                break;
            case AnchorPoint.TAIL:
                for (var i = 0; i < this.segments.length; i++) {
                    if (i === this.segments.length - 1) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.TAIL);
                    } else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    }
                }
                break;
            case AnchorPoint.HEAD_TAIL:
                for (var i = 0; i < this.segments.length; i++) {
                    if (i === 0) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.HEAD);
                    } else if (i === this.segments.length - 1) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.TAIL);
                    } else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    }
                }
                break;
            case AnchorPoint.MOD2:
                for (var i = 0; i < this.segments.length; i++) {
                    if (i % 2 === 0) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.MOD2);
                    } else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    }
                }
                break;
            case AnchorPoint.RAND:
                for (var i = 0; i < this.segments.length; i++) {
                    if (MathUtils.randInt(0, 1) === 0) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.RAND);
                    } else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    }
                }
                break;
            default:
                for (var i = 0; i < this.segments.length; i++) {
                    this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                }
        }

        // uncomment to draw VereltSticks
        // for (let i = 0; i < this.segments.length; i++) {
        //     this.add(this.segments[i])
        // }

        // create tendril
        let pts: Vector3[] = [];
        for (let i = 0; i < this.nodes.length; i++) {
            pts[i] = this.nodes[i].position;
        }
        this.tendrilGeometry = new BufferGeometry().setFromPoints(pts);
        let tendrilMaterial = new LineBasicMaterial({ color: 0x0000ff });
        tendrilMaterial.transparent = true;
        tendrilMaterial.opacity = .95;
        this.tendril = new Line(this.tendrilGeometry, tendrilMaterial);
        this.add(this.tendril);
    }

    // Euler
    public moveNode(index: number, vec: Vector3): void {
        this.nodes[index].position.x += vec.x;
        this.nodes[index].position.y += vec.y;
        this.nodes[index].position.z += vec.z;
    }

    // sets postion
    public moveToNode(index: number, vec: Vector3): void {
        this.nodes[index].position.x = vec.x;
        this.nodes[index].position.y = vec.y;
        this.nodes[index].position.z = vec.z;
    }

    public verlet(isConstrained: boolean = true): void {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].verlet();
            this.nodes[i].rotateX(this.testRot * .1);
            this.nodes[i].rotateY(this.testRot);
            this.nodes[i].rotateZ(-this.testRot * .3);
        }
        if (isConstrained) {
            this.constrain();
        }
        this.testRot += Math.PI / 15080;
    }

    private constrain(): void {
        // constrain nodes using VerletStick
        for (var i = 0; i < this.segmentCount; i++) {
            this.segments[i].constrainLen();
        }

        // update tendril line
        (this.tendril.geometry as BufferGeometry).attributes.position.needsUpdate = true;
        for (var i = 0; i < this.nodes.length; i++) {
            (this.tendril.geometry as BufferGeometry).attributes.position.setXYZ(i, this.nodes[i].position.x, this.nodes[i].position.y, this.nodes[i].position.z);
        }
    }

    public constrainBounds(bounds: Vector3, offset: Vector3 = new Vector3()): void {
        for (var i = 0; i < this.nodes.length; i++) {
            let v = new Vector3(bounds.x + offset.x, bounds.y + offset.y, bounds.z + offset.z);
            this.nodes[i].constrainBounds(v);
        }
    }

    // Resets node position delta and stick lengths
    // required when tranforming strand shapes after initialization
    public resetVerlet(): void {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].resetVerlet();
        }
        for (var i = 0; i < this.segmentCount; i++) {
            this.segments[i].reinitializeLen();
        }
    }

    setHeadPosition(pos: Vector3): void {
        this.nodes[0].position.x = pos.x;
        this.nodes[0].position.y = pos.y;
        this.nodes[0].position.z = pos.z;
    }

    setTailPosition(pos: Vector3): void {
        this.nodes[this.nodes.length - 1].position.x = pos.x;
        this.nodes[this.nodes.length - 1].position.y = pos.y;
        this.nodes[this.nodes.length - 1].position.z = pos.z;
    }

    setNodesVisible(areNodesVisible: boolean): void {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].setNodeVisible(areNodesVisible);
        }
    }

    // enables setting individual node visibiliity by index
    setNodeVisible(index: number, isNodesVisible: boolean): void {
        this.nodes[index].setNodeVisible(isNodesVisible);
    }

    setNodesColor(color: Color): void {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].setNodeColor(color);
        }
    }

    setNodesOpacity(alpha: number): void {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].setNodeAlpha(alpha);
        }
    }

    setNodesScale(scale: number) {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].geometry.scale(scale, scale, scale);
        }
    }

    setStrandOpacity(alpha: number): void {
        let tenMat = this.tendril.material as MeshBasicMaterial;
        tenMat.transparent = true; //annoying ide can't
        tenMat.opacity = alpha;
    }

    setStrandColor(tendrilColor: Color) {
        let tenMat = this.tendril.material as MeshBasicMaterial;
        tenMat.color = tendrilColor;
    }

    setStrandMaterials(tendrilColor: Color, alpha: number): void {
        let tenMat = this.tendril.material as MeshBasicMaterial;
        tenMat.color = tendrilColor;
        tenMat.transparent = true; //annoying ide can't
        tenMat.opacity = alpha;
    }

    setMaterials(tendrilColor: Color, alpha: number, nodeColor: Color): void {
        let tenMat = this.tendril.material as MeshBasicMaterial;
        tenMat.color = tendrilColor;
        tenMat.transparent = true; //annoying ide can't
        tenMat.opacity = alpha;

        for (var i = 0; i < this.nodes.length; i++) {
            let tenMat = this.nodes[i].material as MeshBasicMaterial;
            tenMat.color = nodeColor;
        }
    }



    // createSkin() {
    //     const path = new CustomSinCurve(10);
    //     const geometry = new TubeGeometry(path, 20, 2, 8, false);
    //     const material = new MeshBasicMaterial({ color: 0x00ff00 });
    //     const mesh = new Mesh(geometry, material);
    //     scene.add(mesh);

    // }

}