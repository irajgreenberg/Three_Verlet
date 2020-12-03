// This class supports development
// of an 'independent' softbody organism.
// This work is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall

// Simple verlet node
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------

import * as THREE from '/build/three.module.js';

export class VerletNode extends THREE.Mesh{

  private posOld :THREE.Vector3;
  private radius: number; //for conveneince

  constructor(pos:THREE.Vector3, radius:number = 0.005){
  super(new THREE.SphereBufferGeometry( radius ), new THREE.MeshBasicMaterial( { color: 0xff0000 } ));
  this.radius = radius;
    this.position.set(pos.x, pos.y, pos.z);
    this.posOld = this.position.clone();
  }

  // Start motion with node offset
  moveNode(vec:THREE.Vector3):void {
    this.position.add(vec);
  }

  // Motion determined by position comparison between current and previus frames
  verlet():void {
    let posTemp1:THREE.Vector3 = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
    this.position.x += (this.position.x-this.posOld.x);
    this.position.y += (this.position.y-this.posOld.y);
    this.position.z += (this.position.z-this.posOld.z);
    this.posOld.copy(posTemp1);
  }

  constrainBounds(bounds:THREE.Vector3):void{
    if (this.position.x > bounds.x/2-this.radius){
      this.position.x = bounds.x/2-this.radius;
    } else if (this.position.x < -bounds.x/2+this.radius){
      this.position.x = -bounds.x/2+this.radius;
    }

    if (this.position.y > bounds.y/2-this.radius){
      this.position.y = bounds.y/2-this.radius;
    } else if (this.position.y < -bounds.y/2+this.radius){
      this.position.y = -bounds.y/2+this.radius;
    }

    if (this.position.z > bounds.z/2-this.radius){
      this.position.z = bounds.z/2-this.radius;
    } else if (this.position.z < -bounds.z/2+this.radius){
      this.position.z = -bounds.z/2+this.radius;
    }
    
  }
}