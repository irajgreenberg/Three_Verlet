// This class supports development
// of an 'independent' softbody organism.
// This work is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall
// Simple verlet node
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------
import * as THREE from '/build/three.module.js';
export class VerletStick extends THREE.Group {
    constructor(VNode1, VNode2, stickTension = .4, anchorDetail = 0) {
        super();
        this.meshNodeArr = new Array();
        this.VNode1 = VNode1;
        this.VNode2 = VNode2;
        this.stickTension = stickTension;
        this.anchorDetail = anchorDetail;
        this.VNode1_posOld = VNode1.pos;
        this.VNode2_posOld = VNode2.pos;
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        this.meshNode1 = new THREE.Mesh(VNode1, mat);
        this.meshNode2 = new THREE.Mesh(VNode2, mat);
        // array for conveninece
        this.meshNodeArr[0] = this.meshNode1;
        this.meshNodeArr[1] = this.meshNode2;
        this.meshNode1.position.x = this.VNode1.pos.x;
        this.meshNode1.position.y = this.VNode1.pos.y;
        this.meshNode1.position.z = this.VNode1.pos.z;
        this.meshNode2.position.x = this.VNode2.pos.x;
        this.meshNode2.position.y = this.VNode2.pos.y;
        this.meshNode2.position.z = this.VNode2.pos.z;
        // let tempPos:THREE.Vector3 = this.meshNode2.position;
        // this.vecOrig  =  tempPos.sub(this.meshNode1.position);
        // new THREE.Vector3(this.pos2.x-this.pos1.x, this.pos2.y-this.pos1.y, this.pos2.z-this.pos1.z);
        this.len = this.meshNode2.position.distanceTo(this.meshNode1.position);
        // adds nodes to VerletStick Group
        this.add(this.meshNode1);
        this.add(this.meshNode2);
        // create drawn stick
        // material
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const points = [];
        points.push(this.meshNode1.position);
        points.push(this.meshNode2.position);
        this.stickGeom = new THREE.Geometry();
        this.stickGeom.setFromPoints(points);
        // line
        this.line = new THREE.Line(this.stickGeom, material);
        this.add(this.line);
    }
    verlet() {
        // Verlet Node 1
        let posTemp1 = new THREE.Vector3(this.meshNode1.position.x, this.meshNode1.position.y, this.meshNode1.position.z);
        this.meshNode1.position.x += (this.meshNode1.position.x - this.VNode1_posOld.x);
        this.meshNode1.position.y += (this.meshNode1.position.y - this.VNode1_posOld.y);
        this.meshNode1.position.z += (this.meshNode1.position.z - this.VNode1_posOld.z);
        this.VNode1_posOld.copy(posTemp1);
        // Verlet Node 2
        let posTemp2 = new THREE.Vector3(this.meshNode2.position.x, this.meshNode2.position.y, this.meshNode2.position.z);
        this.meshNode2.position.x += (this.meshNode2.position.x - this.VNode2_posOld.x);
        this.meshNode2.position.y += (this.meshNode2.position.y - this.VNode2_posOld.y);
        this.meshNode2.position.z += (this.meshNode2.position.z - this.VNode2_posOld.z);
        this.VNode2_posOld.copy(posTemp2);
        const points = [];
        points.push(this.meshNode1.position);
        points.push(this.meshNode2.position);
        this.line.geometry.setFromPoints(points);
        this.stickGeom.verticesNeedUpdate = true;
    }
    // Begin stick movement with 
    // initial node displacement
    // b1 = 0, b2 != 0
    moveNode(id, vec) {
        if (id == 1 && this.anchorDetail != 1) {
            this.meshNode1.position.add(vec);
        }
        else if (id == 2 && this.anchorDetail != 2) {
            this.meshNode2.position.add(vec);
        }
    }
    constrainLen() {
        // accuracy factor
        let accuracyCount = 1; //TO DO: make externally controllable eventually
        for (var i = 0; i < accuracyCount; i++) {
            let delta = new THREE.Vector3(this.meshNode2.position.x - this.meshNode1.position.x, this.meshNode2.position.y - this.meshNode1.position.y, this.meshNode2.position.z - this.meshNode1.position.z);
            let deltaLength = delta.length();
            // nodeConstrainFactors optionally anchor stick on one side
            let node1ConstrainFactor = 0.5;
            let node2ConstrainFactor = 0.5;
            if (this.anchorDetail === 1) {
                node1ConstrainFactor = 0.0;
                node2ConstrainFactor = 1.0;
            }
            else if (this.anchorDetail === 2) {
                node1ConstrainFactor = 1.0;
                node2ConstrainFactor = 0.0;
            }
            let difference = ((deltaLength - this.len) / deltaLength);
            this.meshNode1.position.x += delta.x * (node1ConstrainFactor * this.stickTension * difference);
            this.meshNode1.position.y += delta.y * (node1ConstrainFactor * this.stickTension * difference);
            this.meshNode1.position.z += delta.z * (node1ConstrainFactor * this.stickTension * difference);
            this.meshNode2.position.x -= delta.x * (node2ConstrainFactor * this.stickTension * difference);
            this.meshNode2.position.y -= delta.y * (node2ConstrainFactor * this.stickTension * difference);
            this.meshNode2.position.z -= delta.z * (node2ConstrainFactor * this.stickTension * difference);
        }
    }
    constrainBounds(bounds) {
        for (var i = 0; i < 2; i++) {
            if (this.meshNodeArr[i].position.x > bounds.x / 2 - this.VNode1.radius) {
                this.meshNodeArr[i].position.x = bounds.x / 2 - this.VNode1.radius;
                this.meshNodeArr[i].position.x -= .01;
            }
            else if (this.meshNodeArr[i].position.x < -bounds.x / 2 + this.VNode1.radius) {
                this.meshNodeArr[i].position.x = -bounds.x / 2 + this.VNode1.radius;
                this.meshNodeArr[i].position.x += .01;
            }
            if (this.meshNodeArr[i].position.y > bounds.y / 2 - this.VNode1.radius) {
                this.meshNodeArr[i].position.y = bounds.y / 2 - this.VNode1.radius;
                this.meshNodeArr[i].position.y -= .01;
            }
            else if (this.meshNodeArr[i].position.y < -bounds.y / 2 + this.VNode1.radius) {
                this.meshNodeArr[i].position.y = -bounds.y / 2 + this.VNode1.radius;
                this.meshNodeArr[i].position.y += .01;
            }
            if (this.meshNodeArr[i].position.z > bounds.z / 2 - this.VNode1.radius) {
                this.meshNodeArr[i].position.z = bounds.z / 2 - this.VNode1.radius;
                this.meshNodeArr[i].position.z -= .01;
            }
            else if (this.meshNodeArr[i].position.z < -bounds.z / 2 + this.VNode1.radius) {
                this.meshNodeArr[i].position.z = -bounds.z / 2 + this.VNode1.radius;
                this.meshNodeArr[i].position.z += .01;
            }
        }
    }
}
