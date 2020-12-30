import { AnchorPoint } from './IJGUtils.js';
import { VerletNode } from './VerletNode.js';
import { VerletStrand } from './VerletStrand.js';
import { VerletStick } from './VerletStick.js';
import * as THREE from '/build/three.module.js';
import { Vector3 } from '/build/three.module.js';

export class VerletTetrahedron extends THREE.Group {
    pos: Vector3;
    radius: number = 0;
    tension: number;

    // enables differentiated growth by incremental input
    isGrowable: boolean;
    inputCounter: number = 0;

    nodesVecs: Vector3[] = []; //precalculates tetrahedron values
    nodes: VerletNode[] = [];
    sticks: Array<VerletStick> = [];

    nodesOrig: VerletNode[] = [];

    pulseTheta: number = 0;
    freqDrama: number = 0;
    ampDrama: number = 0;
    pulseDamping: number = .795;

    constructor(pos: Vector3, radius: number, tension: number, isGrowable: boolean = false) {
        super();
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


    setNode(): void {
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


    verlet(): void {
        for (var n of this.nodes) {
            n.verlet();
        }
    }

    setNodesColor(color: THREE.Color): void {
        for (var n of this.nodes) {
            n.setNodeColor(color);
        }
    }

    setNodesScale(scl: number): void {
        for (var n of this.nodes) {
            n.geometry.scale(scl, scl, scl);
        }
    }

    setStickVisibility(index: number, isVisible: boolean): void {
        // To Do: add throw safety
        this.sticks[index].setVisibility(isVisible);
    }

    pulseNode(index: number, amp: number, freq: number): void {
        this.nodesOrig[index].position.addScalar(Math.sin(this.pulseTheta) * (amp + this.ampDrama));
        this.nodes[index].position.set(this.nodesOrig[index].position.x, this.nodesOrig[index].position.y, this.nodesOrig[index].position.z);
        this.pulseTheta += freq + this.freqDrama;
        this.freqDrama *= this.pulseDamping;
        this.ampDrama *= this.pulseDamping;
    }

    moveNode(index: number, vec: THREE.Vector3): void {
        this.nodes[index].position.x += vec.x;
        this.nodes[index].position.y += vec.y;
        this.nodes[index].position.z += vec.z;
    }

    constrain(bounds: Vector3): void {
        for (var s of this.sticks) {
            s.constrainLen();
        }

        for (var n of this.nodes) {
            n.constrainBounds(bounds);
        }
    }
}