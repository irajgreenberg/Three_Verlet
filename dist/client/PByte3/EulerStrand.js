// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall
// Creates Euler Tendrils - motion/springin based on speed
import * as THREE from '/build/three.module.js';
import { EulerNode } from './EulerNode.js';
import { EulerStick } from './EulerStick.js';
//const tendrilCount: number = 20;
export class EulerStrand extends THREE.Group {
    constructor(head, tail, segmentCount, elasticity = .5, damping = .725) {
        super();
        this.geometry = new THREE.Geometry();
        this.material = new THREE.MeshBasicMaterial({ color: 0xffffff, });
        this.head = head;
        this.tail = tail;
        this.segmentCount = segmentCount;
        this.segments = new Array(segmentCount);
        this.nodes = new Array(segmentCount + 1);
        //  this.anchorPointDetail = anchorPointDetail;
        this.elasticity = elasticity;
        this.damping = damping;
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
        // Strand nodes
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i] = new EulerNode(new THREE.Vector3(this.head.x + deltaVec.x * segLen * i, this.head.y + deltaVec.y * segLen * i, this.head.z + deltaVec.z * segLen * i), THREE.MathUtils.randFloat(.002, .007), new THREE.Vector3(THREE.MathUtils.randFloatSpread(.01), THREE.MathUtils.randFloatSpread(.006), THREE.MathUtils.randFloatSpread(.008)));
            // show nodes
            this.add(this.nodes[i]);
        }
        for (var i = 0; i < this.segments.length; i++) {
            this.segments[i] = new EulerStick(this.nodes[i], this.nodes[i + 1], this.elasticity, this.damping);
            this.geometry.vertices.push(this.segments[i].start.position);
            if (i === this.segments.length - 1) {
                this.geometry.vertices.push(this.segments[i].end.position);
            }
        }
        let lineMaterial = new THREE.LineBasicMaterial({ color: 0x22ff22, linewidth: 5 });
        this.tendril = new THREE.Line(this.geometry, lineMaterial);
        //this.tendril.material.transparent = true; //annoying ide can't accurately track this
        let tenMat = this.tendril.material; // need assertion  
        tenMat.opacity = .25; //annoying ide can't accurately track this
        //this.tendril.
        this.add(this.tendril);
    }
    move(isConstrained = true) {
        for (var i = 0; i < this.segmentCount; i++) {
            // this.nodes[i].move();
        }
        this.nodes[0].move();
        if (isConstrained) {
            this.constrain();
        }
    }
    constrain() {
        for (var i = 0; i < this.segmentCount; i++) {
            this.segments[i].constrainLen();
        }
        this.geometry.verticesNeedUpdate = true;
    }
    constrainBounds(bounds) {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].constrainBounds(bounds);
        }
    }
}
