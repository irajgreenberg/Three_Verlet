// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall

// Creates Verlet Tendrils - motion/springing based on displacement

import * as THREE from '/build/three.module.js';
import { VerletNode } from './VerletNode.js';
import { VerletStick } from './VerletStick.js';
import { AnchorPoint, GeometryDetail } from './IJGUtils.js';

// helper customcurvepath
// class TendrilCurve extends THREE.Curve {
// }

export class VerletStrand extends THREE.Group {
    public head: THREE.Vector3
    public tail: THREE.Vector3
    segmentCount: number;
    segments: VerletStick[];
    nodes: VerletNode[];
    // controls anchor ponts along strand
    private anchorPointDetail: AnchorPoint;
    // controls spring tension between adjacent nodes
    elasticity: number;
    areNodesVisible: boolean = true;
    geometry = new THREE.Geometry();
    material = new THREE.MeshBasicMaterial({ color: 0xffffff, });
    public tendril: THREE.Line;


    constructor(head: THREE.Vector3, tail: THREE.Vector3, segmentCount: number, anchorPointDetail: AnchorPoint = AnchorPoint.NONE, elasticity: number = .5) {
        super();
        this.head = head;
        this.tail = tail;
        this.segmentCount = segmentCount;
        this.segments = new Array(segmentCount);
        this.nodes = new Array(segmentCount + 1);
        this.anchorPointDetail = anchorPointDetail;
        this.elasticity = elasticity;
        // encapsulaes stick data
        this.tendril = new THREE.Line();


        // local vars for segment calcuations
        let deltaVec = new THREE.Vector3();
        // get chain vector
        deltaVec.subVectors(this.tail, this.head);
        let chainLen = deltaVec.length();
        // get chain segment length
        let segLen = chainLen / this.segments.length;
        deltaVec.normalize();

        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i] = new VerletNode(new THREE.Vector3(this.head.x + deltaVec.x * segLen * i, this.head.y + deltaVec.y * segLen * i, this.head.z + deltaVec.z * segLen * i), THREE.MathUtils.randFloat(.0002, .0007),
                new THREE.Color(.5, .5, .5), GeometryDetail.ICOSA);
            // show nodes
            this.add(this.nodes[i]);
        }

        // add constraints
        switch (this.anchorPointDetail) {
            case AnchorPoint.NONE:
                for (var i = 0; i < this.segments.length; i++) {
                    this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) { this.geometry.vertices.push(this.segments[i].end.position) }
                }
                break;
            case AnchorPoint.HEAD:
                for (var i = 0; i < this.segments.length; i++) {
                    if (i === 0) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.HEAD);
                    } else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    }
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) { this.geometry.vertices.push(this.segments[i].end.position) }
                }
                break;
            case AnchorPoint.TAIL:
                for (var i = 0; i < this.segments.length; i++) {
                    if (i === this.segments.length - 1) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.TAIL);
                    } else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    }
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) { this.geometry.vertices.push(this.segments[i].end.position) }
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
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) { this.geometry.vertices.push(this.segments[i].end.position) }
                }
                break;
            case AnchorPoint.MOD2:
                for (var i = 0; i < this.segments.length; i++) {
                    if (i % 2 === 0) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.MOD2);
                    } else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    }
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) { this.geometry.vertices.push(this.segments[i].end.position) }
                }
                break;
            case AnchorPoint.RAND:
                for (var i = 0; i < this.segments.length; i++) {
                    if (THREE.MathUtils.randInt(0, 1) === 0) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.RAND);
                    } else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    }
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) { this.geometry.vertices.push(this.segments[i].end.position) }
                }
                break;
            default:
                for (var i = 0; i < this.segments.length; i++) {
                    this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) { this.geometry.vertices.push(this.segments[i].end.position) }
                }
        }
        let lineMaterial = new THREE.LineBasicMaterial({ color: 0xcc55cc });
        this.tendril = new THREE.Line(this.geometry, lineMaterial);
        this.tendril.material.transparent = true; //annoying ide can't accurately track this
        this.tendril.material.opacity = .25; //annoying ide can't accurately track this
        //this.tendril.
        this.add(this.tendril);
    }

    public verlet(isConstrained: boolean = true): void {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].verlet();
        }
        if (isConstrained) {
            this.constrain();
        }
    }

    private constrain(): void {
        for (var i = 0; i < this.segmentCount; i++) {
            this.segments[i].constrainLen();
        }
        this.geometry.verticesNeedUpdate = true;
    }

    public constrainBounds(bounds: THREE.Vector3): void {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].constrainBounds(bounds);
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

    setNodesVisible(areNodesVisible: boolean): void {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].setNodeVisible(areNodesVisible);
        }
    }

    setMaterials(tendrilColor: THREE.Color, alpha: number, nodeColor: THREE.Color): void {
        this.tendril.material.color = tendrilColor;
        this.tendril.material.transparent = true; //annoying ide can't
        this.tendril.material.opacity = alpha;

        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].material.color = nodeColor;
        }
    }

    setNodesScale(scale: number) {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].geometry.scale(scale, scale, scale);
        }
    }

    // createSkin() {
    //     const path = new CustomSinCurve(10);
    //     const geometry = new THREE.TubeGeometry(path, 20, 2, 8, false);
    //     const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    //     const mesh = new THREE.Mesh(geometry, material);
    //     scene.add(mesh);

    // }

}