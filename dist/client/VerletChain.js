// This class supports development
// of an 'independent' softbody organism.
// This work is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall
// Simple verlet chain of connected sticks
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------
import * as THREE from '/build/three.module.js';
import { VerletStick } from './VerletStick.js';
import { VerletNode } from './VerletNode.js';
//import { Line } from '/build/three.module.js';
export class VerletChain extends THREE.Group {
    constructor(head, tail, segmentCount, anchorDetail) {
        super();
        this.head = head;
        this.tail = tail;
        this.segments = new Array(segmentCount);
        this.nodes = new Array(segmentCount + 1);
        this.anchorDetail = anchorDetail;
        this.build();
    }
    build() {
        let deltaVec = new THREE.Vector3();
        // get chain vector
        deltaVec.subVectors(this.tail, this.head);
        let chainLen = deltaVec.length();
        // get chain segment length
        let segLen = chainLen / this.segments.length;
        deltaVec.normalize();
        // calculate node positions and sticks
        for (var i = 0; i < this.nodes.length; i++) {
            //next node postiion = head + deltaVec*segLen*i
            this.nodes[i] = new VerletNode(new THREE.Vector3(this.head.x + deltaVec.x * segLen * i, this.head.x + deltaVec.y * segLen * i, this.head.x + deltaVec.z * segLen * i));
            if (i > 0) {
                this.segments[i - 1] = new VerletStick(this.nodes[i - 1], this.nodes[i], .002, 0);
                this.add(this.segments[i - 1]);
            }
        }
    }
    moveSegment(id, vec) {
        try {
            if (id < 0 || id > this.segments.length - 1) {
                throw new RangeError("VerletNode id out of range, needs to be between 0 and segmentCount-1");
                // always throws node 1 of selected segment
            }
            else {
                this.segments[id].moveNode(1, vec);
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    verlet() {
        for (var i = 0; i < this.segments.length; i++) {
            //if (i>0) {
            this.segments[i].verlet();
            this.segments[i].constrainLen();
            //}
        }
    }
    constrainBounds(bounds) {
        for (var i = 0; i < this.segments.length; i++) {
            //if (i>0) {
            this.segments[i].constrainBounds(bounds);
            //}
        }
    }
}
