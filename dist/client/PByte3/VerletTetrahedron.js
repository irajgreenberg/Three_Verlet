import { VerletNode } from './VerletNode.js';
import { VerletStick } from './VerletStick.js';
import * as THREE from '/build/three.module.js';
import { Vector3 } from '/build/three.module.js';
export class VerletTetrahedron extends THREE.Group {
    constructor(pos, radius, tension, isGrowable = false) {
        super();
        this.radius = 0;
        this.inputCounter = 0;
        this.nodesVecs = []; //precalculates tetrahedron values
        this.nodes = [];
        this.sticks = [];
        this.nodesOrig = [];
        this.pulseTheta = 0;
        this.freqDrama = 0;
        this.ampDrama = 0;
        this.pulseDamping = .795;
        this.pos = pos;
        this.radius = radius;
        this.tension = tension;
        this.isGrowable = isGrowable;
        this.position.set(pos.x, pos.y, pos.z);
        //top node
        this.nodesVecs.push(new Vector3(0, radius, 0));
        this.nodes.push(new VerletNode(new Vector3(0, radius, 0), .01));
        this.nodesOrig.push(new VerletNode(new Vector3(0, radius, 0), .01));
        // traingle ring
        let theta = 0;
        for (var i = 0; i < 3; i++) {
            this.nodesVecs.push(new Vector3(Math.sin(theta) * radius, 0, Math.cos(theta) * radius));
            this.nodes.push(new VerletNode(new Vector3(Math.sin(theta) * radius, 0, Math.cos(theta) * radius), .01));
            this.nodesOrig.push(new VerletNode(new Vector3(Math.sin(theta) * radius, 0, Math.cos(theta) * radius), .01));
            theta += 120 * Math.PI / 180;
        }
        // bottom node
        this.nodesVecs.push(new Vector3(0, -radius, -0));
        this.nodes.push(new VerletNode(new Vector3(0, -radius, -0), .01));
        this.nodesOrig.push(new VerletNode(new Vector3(0, -radius, -0), .01));
        // add nodes and sticks to group
        if (!this.isGrowable) { // add at contruction is no growable
            for (var n of this.nodes) {
                this.add(n);
            }
        }
        this.sticks.push(new VerletStick(this.nodes[0], this.nodes[1], .01));
        this.sticks.push(new VerletStick(this.nodes[0], this.nodes[2], .01));
        this.sticks.push(new VerletStick(this.nodes[0], this.nodes[3], .01));
        this.sticks.push(new VerletStick(this.nodes[4], this.nodes[1], .01));
        this.sticks.push(new VerletStick(this.nodes[4], this.nodes[2], .01));
        this.sticks.push(new VerletStick(this.nodes[4], this.nodes[3], .01));
        this.sticks.push(new VerletStick(this.nodes[1], this.nodes[2], .01));
        this.sticks.push(new VerletStick(this.nodes[2], this.nodes[3], .01));
        this.sticks.push(new VerletStick(this.nodes[3], this.nodes[1], .01));
        //extra central axis
        this.sticks.push(new VerletStick(this.nodes[0], this.nodes[4], 0));
        // add sticks to group
        if (!this.isGrowable) { // add at contruction is no growable
            for (var s of this.sticks) {
                this.add(s);
            }
        }
    }
    setNode() {
        if (this.isGrowable) {
            if (this.inputCounter < 5) {
                this.add(this.nodes[this.inputCounter]);
            }
            if (this.inputCounter > 0 && this.inputCounter < 11) {
                this.add(this.sticks[this.inputCounter - 1]);
            }
            if (this.inputCounter < 11) {
                this.freqDrama = .25;
                this.ampDrama = .05;
                this.inputCounter++;
            }
        }
    }
    verlet() {
        for (var n of this.nodes) {
            n.verlet();
        }
    }
    setNodesGeom(geom) {
        for (var n of this.nodes) {
            // to do
        }
    }
    setNodesColor(color) {
        for (var n of this.nodes) {
            n.setNodeColor(color);
        }
    }
    setSticksColor(color) {
        for (var s of this.sticks) {
            s.setColor(color);
        }
    }
    setNodesScale(scl) {
        for (var n of this.nodes) {
            n.geometry.scale(scl, scl, scl);
        }
    }
    setStickVisibility(index, isVisible) {
        // To Do: add throw safety
        this.sticks[index].setVisibility(isVisible);
    }
    pulseNode(index, amp, freq) {
        this.nodesOrig[index].position.addScalar(Math.sin(this.pulseTheta) * (amp + this.ampDrama));
        this.nodes[index].position.set(this.nodesOrig[index].position.x, this.nodesOrig[index].position.y, this.nodesOrig[index].position.z);
        this.pulseTheta += freq + this.freqDrama;
        this.freqDrama *= this.pulseDamping;
        this.ampDrama *= this.pulseDamping;
    }
    moveNode(index, vec) {
        this.nodes[index].position.x += vec.x;
        this.nodes[index].position.y += vec.y;
        this.nodes[index].position.z += vec.z;
    }
    constrain(bounds) {
        for (var s of this.sticks) {
            s.constrainLen();
        }
        for (var n of this.nodes) {
            n.constrainBounds(bounds);
        }
    }
}
