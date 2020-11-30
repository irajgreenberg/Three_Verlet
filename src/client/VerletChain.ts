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
import { Vector3 } from '/build/three.module.js';
//import { Line } from '/build/three.module.js';

export class VerletChain extends THREE.Group {
    public head:THREE.Vector3
    public tail:THREE.Vector3 
    public segments:VerletStick[];
    private nodes:VerletNode[];
    // anchor stick detail
    private anchorDetail:number;

    constructor(head:THREE.Vector3, tail:THREE.Vector3, segmentCount:number, anchorDetail:number) {
        super();
        this.head = head;
        this.tail = tail;
        this.segments = new Array(segmentCount);
        this.nodes = new Array(segmentCount+1);
        this.anchorDetail = anchorDetail;
        this.build();
    }

    private build():void {
        let deltaVec = new THREE.Vector3();
        // get chain vector
        deltaVec.subVectors(this.tail, this.head);
        let chainLen = deltaVec.length();
        // get chain segment length
        let segLen = chainLen/this.segments.length;
        deltaVec.normalize();
        // calculate node positions and sticks
        for(var i=0; i<this.nodes.length; i++) {
            //next node postiion = head + deltaVec*segLen*i
            this.nodes[i] = new VerletNode(new THREE.Vector3(this.head.x+deltaVec.x*segLen*i, this.head.x+deltaVec.y*segLen*i, this.head.x+deltaVec.z*segLen*i));
            if (i>0){
                this.segments[i-1] = new VerletStick(this.nodes[i-1], this.nodes[i],.002, 0);
                this.add(this.segments[i-1]); 
            }
        }
    }

    public moveSegment(id:number, vec:THREE.Vector3){
        try {
            if (id < 0 || id > this.segments.length-1){
                throw new RangeError("VerletNode id out of range, needs to be between 0 and segmentCount-1");
                // always throws node 1 of selected segment
               
            } else {
                this.segments[id].moveNode(1, vec);
            }
          }
          catch(e) {
            console.log(e);
          }  
    }

    public verlet():void {
        for(var i=0; i<this.segments.length; i++) {
            //if (i>0) {
                this.segments[i].verlet();
                this.segments[i].constrainLen();
            //}
        }
    }
    
    public constrainBounds(bounds:THREE.Vector3):void {
        for(var i=0; i<this.segments.length; i++) {
            //if (i>0) {
                this.segments[i].constrainBounds(bounds);
            //}
        }
    }
}