// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall

// Simple verlet Stick
// manages constraint of verlet nodes
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------

import * as THREE from '/build/three.module.js';
import { VerletNode } from './VerletNode.js';
import { Line } from '/build/three.module.js';


export class VerletStick {
 
  private stickTension:number;
  // // anchor stick detail
  private anchorDetail:number;
  start: VerletNode;
  end: VerletNode;
  len: number;


  constructor(start: VerletNode, end: VerletNode, stickTension:number = .4, anchorDetail: number = 0){
    this.start = start;
    this.end = end;
    this.len = this.start.position.distanceTo(this.end.position);
    this.stickTension = stickTension;
    this.anchorDetail = anchorDetail;
    // super.material = new THREE.LineBasicMaterial( { color: 0x0000ff } );

    // const points = [];
    // points.push( start.position );
    // points.push( end.position );

    // this.geometry = new THREE.BufferGeometry().setFromPoints( points );
  }

  constrainLen():void {
    // accuracy factor
    let accuracyCount:number = 1; //TO DO: make externally controllable eventually
    for (var i=0; i<accuracyCount; i++) {
      let delta:THREE.Vector3 = new THREE.Vector3(this.end.position.x-this.start.position.x, 
                                                  this.end.position.y-this.start.position.y, 
                                                  this.end.position.z-this.start.position.z);
      let deltaLength:number = delta.length();
      
      // nodeConstrainFactors optionally anchor stick on one side
      let node1ConstrainFactor:number = 0.5;
      let node2ConstrainFactor:number = 0.5;
     // console.log ("this.anchorDetail = " + this.anchorDetail);
      if(this.anchorDetail===1){
        node1ConstrainFactor = 0.0;
        node2ConstrainFactor = 1.0;
      } 
      if(this.anchorDetail===2){
        node1ConstrainFactor = 1.0;
        node2ConstrainFactor = 0.0;
      }
      let difference:number = ((deltaLength - this.len) / deltaLength);
      this.start.position.x += delta.x * (node1ConstrainFactor *  this.stickTension * difference);
      this.start.position.y += delta.y * (node1ConstrainFactor *  this.stickTension * difference);
      this.start.position.z += delta.z * (node1ConstrainFactor *  this.stickTension * difference);
      this.end.position.x -= delta.x * (node2ConstrainFactor *  this.stickTension * difference);
      this.end.position.y -= delta.y * (node2ConstrainFactor *  this.stickTension * difference);
      this.end.position.z -= delta.z * (node2ConstrainFactor *  this.stickTension * difference);
    }
  }
}