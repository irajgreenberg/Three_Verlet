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
    constructor(head, tail, segmentCount, anchorPointDetail = AnchorPoint.NONE, elasticity = .5, nodeType = GeometryDetail.SPHERE_LOW, nodeRadius = THREE.MathUtils.randFloat(.0002, .0007)) {
        super();
        this.areNodesVisible = true;
        this.geometry = new THREE.Geometry();
        this.material = new THREE.MeshBasicMaterial({ color: 0xffffff, });
        // used to cheaply rotate nodes around their local axis
        // should eventually be set as a per node property
        this.testRot = 0;
        this.head = head;
        this.tail = tail;
        this.segmentCount = segmentCount;
        this.segments = new Array(segmentCount);
        this.nodes = new Array(segmentCount + 1);
        this.anchorPointDetail = anchorPointDetail;
        this.elasticity = elasticity;
        this.nodeType = nodeType;
        // encapsulaes stick data
        this.tendril = new THREE.Line();
        // local vars for segment calcuations
        let deltaVec = new THREE.Vector3();
        // get chain vector
        deltaVec.subVectors(this.head, this.tail);
        let chainLen = deltaVec.length();
        // get chain segment length
        let segLen = chainLen / this.segments.length;
        deltaVec.normalize();
        deltaVec.multiplyScalar(segLen);
        console.log(deltaVec);
        for (var i = 0; i < this.nodes.length; i++) {
            // working, but copies values - so lose reference to node object pesition in memory
            this.nodes[i] = new VerletNode(new THREE.Vector3(this.head.x + deltaVec.x * i, this.head.y + deltaVec.y * i, this.head.z + deltaVec.z * i), THREE.MathUtils.randFloat(.0002, .0007), new THREE.Color(.5, .5, .5), this.nodeType);
            // NOT working
            // deltaVec.multiplyScalar(segLen * i);
            // this.head.add(deltaVec);
            // console.log(this.head);
            // this.nodes[i] = new VerletNode(this.head, THREE.MathUtils.randFloat(.0002, .0007),
            //     new THREE.Color(.5, .5, .5), this.nodeType);
            // show nodes
            this.add(this.nodes[i]);
        }
        // add constraints
        switch (this.anchorPointDetail) {
            case AnchorPoint.NONE:
                for (var i = 0; i < this.segments.length; i++) {
                    this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) {
                        this.geometry.vertices.push(this.segments[i].end.position);
                    }
                }
                break;
            case AnchorPoint.HEAD:
                for (var i = 0; i < this.segments.length; i++) {
                    if (i === 0) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.HEAD);
                    }
                    else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    }
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) {
                        this.geometry.vertices.push(this.segments[i].end.position);
                    }
                }
                break;
            case AnchorPoint.TAIL:
                for (var i = 0; i < this.segments.length; i++) {
                    if (i === this.segments.length - 1) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.TAIL);
                    }
                    else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    }
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) {
                        this.geometry.vertices.push(this.segments[i].end.position);
                    }
                }
                break;
            case AnchorPoint.HEAD_TAIL:
                for (var i = 0; i < this.segments.length; i++) {
                    if (i === 0) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.HEAD);
                    }
                    else if (i === this.segments.length - 1) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.TAIL);
                    }
                    else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    }
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) {
                        this.geometry.vertices.push(this.segments[i].end.position);
                    }
                }
                break;
            case AnchorPoint.MOD2:
                for (var i = 0; i < this.segments.length; i++) {
                    if (i % 2 === 0) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.MOD2);
                    }
                    else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    }
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) {
                        this.geometry.vertices.push(this.segments[i].end.position);
                    }
                }
                break;
            case AnchorPoint.RAND:
                for (var i = 0; i < this.segments.length; i++) {
                    if (THREE.MathUtils.randInt(0, 1) === 0) {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.RAND);
                    }
                    else {
                        this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    }
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) {
                        this.geometry.vertices.push(this.segments[i].end.position);
                    }
                }
                break;
            default:
                for (var i = 0; i < this.segments.length; i++) {
                    this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], this.elasticity, AnchorPoint.NONE);
                    this.geometry.vertices.push(this.segments[i].start.position);
                    if (i === this.segments.length - 1) {
                        this.geometry.vertices.push(this.segments[i].end.position);
                    }
                }
        }
        let lineMaterial = new THREE.LineBasicMaterial({ color: 0xcc55cc });
        this.tendril = new THREE.Line(this.geometry, lineMaterial);
        let tenMat = this.tendril.material; // assertion to keep TS Intellisence happy
        tenMat.transparent = true; //annoying ide can't accurately track this w/o insertion
        tenMat.opacity = .25; //annoying ide can't accurately track this w/o insertion
        //this.tendril.
        this.add(this.tendril);
    }
    moveNode(index, vec) {
        this.nodes[index].position.x += vec.x;
        this.nodes[index].position.y += vec.y;
        this.nodes[index].position.z += vec.z;
    }
    verlet(isConstrained = true) {
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
    constrain() {
        for (var i = 0; i < this.segmentCount; i++) {
            this.segments[i].constrainLen();
        }
        this.geometry.verticesNeedUpdate = true;
    }
    constrainBounds(bounds, offset = new THREE.Vector3()) {
        for (var i = 0; i < this.nodes.length; i++) {
            let v = new THREE.Vector3(bounds.x + offset.x, bounds.y + offset.y, bounds.z + offset.z);
            this.nodes[i].constrainBounds(v);
        }
    }
    // Resets node position delta and stick lengths
    // required when tranforming strand shapes after initialization
    resetVerlet() {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].resetVerlet();
        }
        for (var i = 0; i < this.segmentCount; i++) {
            this.segments[i].reinitializeLen();
        }
    }
    setHeadPosition(pos) {
        this.nodes[0].position.x = pos.x;
        this.nodes[0].position.y = pos.y;
        this.nodes[0].position.z = pos.z;
    }
    setTailPosition(pos) {
        this.nodes[this.nodes.length - 1].position.x = pos.x;
        this.nodes[this.nodes.length - 1].position.y = pos.y;
        this.nodes[this.nodes.length - 1].position.z = pos.z;
    }
    setNodesVisible(areNodesVisible) {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].setNodeVisible(areNodesVisible);
        }
    }
    // enables setting individual node visibiliity by index
    setNodeVisible(index, isNodesVisible) {
        this.nodes[index].setNodeVisible(isNodesVisible);
    }
    setNodesColor(color) {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].setNodeColor(color);
        }
    }
    setStrandOpacity(alpha) {
        let tenMat = this.tendril.material;
        tenMat.transparent = true; //annoying ide can't
        tenMat.opacity = alpha;
    }
    setStrandMaterials(tendrilColor, alpha) {
        let tenMat = this.tendril.material;
        tenMat.color = tendrilColor;
        tenMat.transparent = true; //annoying ide can't
        tenMat.opacity = alpha;
    }
    setMaterials(tendrilColor, alpha, nodeColor) {
        let tenMat = this.tendril.material;
        tenMat.color = tendrilColor;
        tenMat.transparent = true; //annoying ide can't
        tenMat.opacity = alpha;
        for (var i = 0; i < this.nodes.length; i++) {
            let tenMat = this.nodes[i].material;
            tenMat.color = nodeColor;
        }
    }
    setNodesScale(scale) {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].geometry.scale(scale, scale, scale);
        }
    }
}
