// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall
// Simple verlet Stick
// manages constraint of verlet nodes
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------
//import {Group, Line, Geometry, LineBasicMaterial, Vector3, Color} from 'three';
import { Group, Line, Geometry, LineBasicMaterial, Vector3 } from '/build/three.module.js';
export class VerletStick extends Group {
    constructor(start, end, stickTension = .4, anchorTerminal = 0, isVisible = true) {
        super();
        this.lineGeometry = new Geometry();
        this.start = start;
        this.end = end;
        this.len = this.start.position.distanceTo(this.end.position);
        this.stickTension = stickTension;
        this.anchorTerminal = anchorTerminal;
        this.isVisible = isVisible;
        this.lineMaterial = new LineBasicMaterial({ color: 0xcc55cc });
        this.lineGeometry.vertices.push(this.start.position);
        this.lineGeometry.vertices.push(this.end.position);
        this.lineMaterial = new LineBasicMaterial({ color: 0xcc55cc });
        this.line = new Line(this.lineGeometry, this.lineMaterial);
        this.lineMaterial.transparent = true;
        this.lineMaterial.opacity = .25;
        this.add(this.line);
    }
    constrainLen() {
        // accuracy factor
        let accuracyCount = 1; //TO DO: make externally controllable eventually
        for (var i = 0; i < accuracyCount; i++) {
            let delta = new Vector3(this.end.position.x - this.start.position.x, this.end.position.y - this.start.position.y, this.end.position.z - this.start.position.z);
            let deltaLength = delta.length();
            // nodeConstrainFactors optionally anchor stick on one side
            let node1ConstrainFactor = 0.5;
            let node2ConstrainFactor = 0.5;
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
            let difference = ((deltaLength - this.len) / deltaLength);
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
    setColor(color) {
        this.lineMaterial.color = color;
    }
    setOpacity(alpha) {
        this.lineMaterial.opacity = alpha;
    }
    setVisibility(isVisible) {
        this.isVisible = isVisible;
    }
    reinitializeLen() {
        this.len = this.start.position.distanceTo(this.end.position);
    }
}
