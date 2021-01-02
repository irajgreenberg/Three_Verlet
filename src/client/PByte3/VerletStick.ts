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


export class VerletStick extends THREE.Group {

  private stickTension: number;
  // // anchor stick detail
  private anchorTerminal: number;
  start: VerletNode;
  end: VerletNode;
  len: number;
  line: THREE.Line
  lineGeometry = new THREE.Geometry();
  lineMaterial: THREE.LineBasicMaterial;
  isVisible: boolean


  constructor(start: VerletNode, end: VerletNode, stickTension: number = .4, anchorTerminal: number = 0, isVisible: boolean = true) {
    super();
    this.start = start;
    this.end = end;
    this.len = this.start.position.distanceTo(this.end.position);
    this.stickTension = stickTension;
    this.anchorTerminal = anchorTerminal;
    this.isVisible = isVisible;
    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xcc55cc });
    this.lineGeometry.vertices.push(this.start.position);
    this.lineGeometry.vertices.push(this.end.position);
    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xcc55cc });
    this.line = new THREE.Line(this.lineGeometry, this.lineMaterial);
    this.lineMaterial.transparent = true;
    this.lineMaterial.opacity = .25;
    this.add(this.line);
  }

  constrainLen(): void {
    // accuracy factor
    let accuracyCount: number = 1; //TO DO: make externally controllable eventually
    for (var i = 0; i < accuracyCount; i++) {
      let delta: THREE.Vector3 = new THREE.Vector3(
        this.end.position.x - this.start.position.x,
        this.end.position.y - this.start.position.y,
        this.end.position.z - this.start.position.z);
      let deltaLength: number = delta.length();

      // nodeConstrainFactors optionally anchor stick on one side
      let node1ConstrainFactor: number = 0.5;
      let node2ConstrainFactor: number = 0.5;

      if (this.anchorTerminal === 1) {
        node1ConstrainFactor = 0.0;
        node2ConstrainFactor = 1.0;
      }
      if (this.anchorTerminal === 2) {
        node1ConstrainFactor = 1.0;
        node2ConstrainFactor = 0.0;
      }
      let difference: number = ((deltaLength - this.len) / deltaLength);
      this.start.position.x += delta.x * (node1ConstrainFactor * this.stickTension * difference);
      this.start.position.y += delta.y * (node1ConstrainFactor * this.stickTension * difference);
      this.start.position.z += delta.z * (node1ConstrainFactor * this.stickTension * difference);
      this.end.position.x -= delta.x * (node2ConstrainFactor * this.stickTension * difference);
      this.end.position.y -= delta.y * (node2ConstrainFactor * this.stickTension * difference);
      this.end.position.z -= delta.z * (node2ConstrainFactor * this.stickTension * difference);
    }
    this.lineGeometry.verticesNeedUpdate = true;
    this.lineMaterial.needsUpdate = true;

    if (!this.isVisible) {
      this.line.visible = false;
    }
  }

  setColor(color: THREE.Color): void {
    this.lineMaterial.color = color;
  }

  setOpacity(alpha: number): void {
    this.lineMaterial.opacity = alpha;
  }

  setVisibility(isVisible: boolean): void {
    this.isVisible = isVisible;
  }
  reinitializeLen(): void {
    this.len = this.start.position.distanceTo(this.end.position);
  }
}