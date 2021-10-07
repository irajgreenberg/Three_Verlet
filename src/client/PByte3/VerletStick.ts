// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall
// help from: https://sbcode.net/threejs/geometry-to-buffergeometry/

// Simple verlet Stick
// manages constraint of verlet nodes

// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------

import * as THREE from 'three';
import { BufferGeometry, Vector3 } from 'three';
import { VerletNode } from './VerletNode';

export class VerletStick extends THREE.Group {

  stickTension: number;
  // anchor stick detail
  anchorTerminal: number;
  start: VerletNode;
  end: VerletNode;
  len: number;
  line: THREE.Line
  lineGeometry: BufferGeometry;
  lineMaterial: THREE.LineBasicMaterial;
  isVisible: boolean
  points: Vector3[] = [];

  constructor(start: VerletNode, end: VerletNode, stickTension: number = .05, anchorTerminal: number = 0, isVisible: boolean = true) {
    super();
    this.start = start;
    this.end = end;
    this.len = this.start.position.distanceTo(this.end.position);
    this.stickTension = stickTension;
    this.anchorTerminal = anchorTerminal;
    this.isVisible = isVisible;
    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xcc55cc });
    this.points.push(this.start.position);
    this.points.push(this.end.position);
    this.lineGeometry = new BufferGeometry().setFromPoints(this.points);
    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    this.line = new THREE.Line(this.lineGeometry, this.lineMaterial);
    this.lineMaterial.transparent = true;
    this.lineMaterial.opacity = 1;
    this.lineMaterial.linewidth = 5;
    this.add(this.line);
  }

  constrainLen(): void {
    // accuracy factor
    let accuracyCount: number = 3; //TO DO: make externally controllable eventually
    let x1 = 0; let y1 = 0; let z1 = 0;
    let x2 = 0; let y2 = 0; let z2 = 0;
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
      if (this.anchorTerminal === 3) {
        node1ConstrainFactor = 0.0;
        node2ConstrainFactor = 0.0;
      }
      if (this.anchorTerminal === 4) {
        node1ConstrainFactor = .1;
        node2ConstrainFactor = .1;
      }

      let difference: number = (deltaLength - this.len) / deltaLength;
      this.start.position.x += delta.x * (node1ConstrainFactor * this.stickTension * difference);
      this.start.position.y += delta.y * (node1ConstrainFactor * this.stickTension * difference);
      this.start.position.z += delta.z * (node1ConstrainFactor * this.stickTension * difference);
      this.end.position.x -= delta.x * (node2ConstrainFactor * this.stickTension * difference);
      this.end.position.y -= delta.y * (node2ConstrainFactor * this.stickTension * difference);
      this.end.position.z -= delta.z * (node2ConstrainFactor * this.stickTension * difference);
    }

    // need to use these 3 lines to update vertixes
    (this.line.geometry as BufferGeometry).attributes.position.needsUpdate = true;
    this.line.geometry.attributes.position.setXYZ(0, this.start.position.x, this.start.position.y, this.start.position.z);
    this.line.geometry.attributes.position.setXYZ(1, this.end.position.x, this.end.position.y, this.end.position.z);

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