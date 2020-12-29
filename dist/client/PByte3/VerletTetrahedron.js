import { VerletNode } from './VerletNode.js';
import { VerletStick } from './VerletStick.js';
import * as THREE from '/build/three.module.js';
import { Vector3 } from '/build/three.module.js';
export class VerletTetrahedron extends THREE.Group {
    constructor(pos, radius, tension) {
        super();
        this.radius = 0;
        this.nodes = [];
        this.sticks = [];
        this.nodesOrig = [];
        this.pulseTheta = 0;
        this.pos = pos;
        this.radius = radius;
        this.tension = tension;
        this.position.set(pos.x, pos.y, pos.z);
        //top node
        this.nodes.push(new VerletNode(new Vector3(0, radius, 0), .01));
        this.nodesOrig.push(new VerletNode(new Vector3(0, radius, 0), .01));
        // traingle ring
        let theta = 0;
        for (var i = 0; i < 3; i++) {
            this.nodes.push(new VerletNode(new Vector3(Math.sin(theta) * radius, 0, Math.cos(theta) * radius), .01));
            this.nodesOrig.push(new VerletNode(new Vector3(Math.sin(theta) * radius, 0, Math.cos(theta) * radius), .01));
            theta += 120 * Math.PI / 180;
        }
        // bottom node
        this.nodes.push(new VerletNode(new Vector3(0, -radius, -0), .01));
        this.nodesOrig.push(new VerletNode(new Vector3(0, -radius, -0), .01));
        // add nodes to group
        for (var n of this.nodes) {
            this.add(n);
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
        this.sticks.push(new VerletStick(this.nodes[0], this.nodes[4], 0));
        // add sticks to group
        for (var s of this.sticks) {
            this.add(s);
        }
    }
    verlet() {
        for (var n of this.nodes) {
            n.verlet();
        }
    }
    setNodesScale(scl) {
        // for (var s of this.strands) {
        //     s.setNodesScale(scl);
        // }
        for (var n of this.nodes) {
            // n.setScale(scl);
        }
    }
    setStickVisibility(index, isVisible) {
        // To Do: add throw safety
        this.sticks[index].setVisibility(isVisible);
    }
    pulseNode(index, amp, freq) {
        this.nodesOrig[index].position.addScalar(Math.sin(this.pulseTheta) * amp);
        this.nodes[index].position.set(this.nodesOrig[index].position.x, this.nodesOrig[index].position.y, this.nodesOrig[index].position.z);
        this.pulseTheta += freq;
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
