// draw tendrils

import * as THREE from '/build/three.module.js';
import { VerletNode } from './VerletNode.js';
import { VerletStick } from './VerletStick.js';


export enum AnchorPoint {
    NONE,
    HEAD,
    TAIL,
    HEAD_TAIL,
    MOD2,
    RAND
}

//const tendrilCount: number = 20;
export class VerletStrand extends THREE.Group {
    public head: THREE.Vector3
    public tail: THREE.Vector3
    segmentCount: number;
    segments: VerletStick[];
    nodes: VerletNode[];
    // anchor stick detail
    private anchorPointDetail: AnchorPoint;
    geometry = new THREE.Geometry();
    material = new THREE.MeshBasicMaterial({ color: 0xffffff, });
    public tendril: THREE.Line;


    constructor(head: THREE.Vector3, tail: THREE.Vector3, segmentCount: number, anchorPointDetail: AnchorPoint = AnchorPoint.NONE) {
        super();
        this.head = head;
        this.tail = tail;
        this.segmentCount = segmentCount;
        this.segments = new Array(segmentCount);
        this.nodes = new Array(segmentCount + 1);
        this.anchorPointDetail = anchorPointDetail;
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
            this.nodes[i] = new VerletNode(new THREE.Vector3(this.head.x + deltaVec.x * segLen * i, this.head.x + deltaVec.y * segLen * i, this.head.x + deltaVec.z * segLen * i), THREE.MathUtils.randFloat(.0002, .0007));
            // show nodes
            this.add(this.nodes[i]);
            if (i > 0 && i % 2 === 0) {
               // this.nodes[i].moveNode(new THREE.Vector3(THREE.MathUtils.randFloatSpread(.01), THREE.MathUtils.randFloatSpread(.01), THREE.MathUtils.randFloatSpread(.01)));
            }
        }

        // move nodes
        // move node 2
        this.nodes[9].moveNode(new THREE.Vector3(THREE.MathUtils.randFloatSpread(.1), THREE.MathUtils.randFloatSpread(.1), THREE.MathUtils.randFloatSpread(.1)));

        // add constraints
        switch (this.anchorPointDetail) {
            case AnchorPoint.NONE:
                for (var i = 0; i < this.segments.length; i++) {
                    this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.2, .4), AnchorPoint.NONE);
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) { this.geometry.vertices.push(this.segments[i].end.position) }
                }
                break;
            case AnchorPoint.HEAD:
                for (var i = 0; i < this.segments.length; i++) {
                    if (i === 0) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.2, .4), AnchorPoint.HEAD);
                    } else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.2, .4), AnchorPoint.NONE);
                    }
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) { this.geometry.vertices.push(this.segments[i].end.position) }
                }
                break;
            case AnchorPoint.TAIL:
                for (var i = 0; i < this.segments.length; i++) {
                    if (i === this.segments.length - 1) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.2, .4), AnchorPoint.TAIL);
                    } else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.2, .4), AnchorPoint.NONE);
                    }
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) { this.geometry.vertices.push(this.segments[i].end.position) }
                }
                break;
            case AnchorPoint.HEAD_TAIL:
                for (var i = 0; i < this.segments.length; i++) {
                    if (i === 0) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.7, .9), AnchorPoint.HEAD);
                    } else if (i === this.segments.length - 1) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.7, .9), AnchorPoint.TAIL);
                    } else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.7, .9), AnchorPoint.NONE);
                    }
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) { this.geometry.vertices.push(this.segments[i].end.position) }
                }
                break;
            case AnchorPoint.MOD2:
                for (var i = 0; i < this.segments.length; i++) {
                    if (i % 2 === 0) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.2, .4), AnchorPoint.MOD2);
                    } else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.2, .4), AnchorPoint.NONE);
                    }
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) { this.geometry.vertices.push(this.segments[i].end.position) }
                }
                break;
            case AnchorPoint.RAND:
                for (var i = 0; i < this.segments.length; i++) {
                    if (THREE.MathUtils.randInt(0, 1) === 0) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.2, .4), AnchorPoint.RAND);
                    } else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.2, .4), AnchorPoint.NONE);
                    }
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) { this.geometry.vertices.push(this.segments[i].end.position) }
                }
                break;
            default:
                for (var i = 0; i < this.segments.length; i++) {
                    this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.2, .4), AnchorPoint.NONE);
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) { this.geometry.vertices.push(this.segments[i].end.position) }
                }
        }
        let lineMaterial = new THREE.LineBasicMaterial({ color: 0xff8888, linewidth:.1});
        this.tendril = new THREE.Line(this.geometry, lineMaterial);
        this.tendril.material.transparent = true; //annoying ide can't accurately track this
        this.tendril.material.opacity = .25; //annoying ide can't accurately track this
        //this.tendril.
        this.add(this.tendril);
    }
}