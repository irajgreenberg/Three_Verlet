import { AnchorPoint, GeometryDetail } from './IJGUtils.js';
import { VerletNode } from './VerletNode.js';
import { VerletStrand } from './VerletStrand.js';
import { VerletStick } from './VerletStick.js';
import * as THREE from '/build/three.module.js';
import { Color, Vector3 } from '/build/three.module.js';

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
    tetraTendrils: VerletStrand[] = [];

    nodesOrig: VerletNode[] = [];

    pulseTheta: number = 0;
    freqDrama: number = 0;
    ampDrama: number = 0;
    pulseDamping: number = .795;

    // for roating nodes
    theta = Math.PI / 20;

    constructor(pos: Vector3, radius: number, tension: number, isGrowable: boolean = false) {
        super();
        this.pos = pos;
        this.radius = radius;
        this.tension = tension;
        this.isGrowable = isGrowable;

        //this.position.set(pos.x, pos.y, pos.z);

        //top node
        this.nodesVecs.push(new Vector3(pos.x, pos.y + radius, pos.z));
        this.nodes.push(new VerletNode(new Vector3(pos.x, pos.y + radius, pos.z), .01, new THREE.Color(0), GeometryDetail.ICOSA));
        this.nodesOrig.push(new VerletNode(new Vector3(pos.x, pos.y + radius, pos.z), .01, new THREE.Color(0), GeometryDetail.ICOSA));

        // traingle ring
        let theta = 0;
        for (var i = 0; i < 3; i++) {
            this.nodesVecs.push(new Vector3(pos.x + Math.sin(theta) * radius, pos.y, pos.z + Math.cos(theta) * radius));
            this.nodes.push(new VerletNode(new Vector3(pos.x + Math.sin(theta) * radius, pos.y, pos.z + Math.cos(theta) * radius), .01, new THREE.Color(0), GeometryDetail.ICOSA));
            this.nodesOrig.push(new VerletNode(new Vector3(pos.x + Math.sin(theta) * radius, pos.y, pos.z + Math.cos(theta) * radius), .01, new THREE.Color(0), GeometryDetail.ICOSA));
            theta += 120 * Math.PI / 180;
        }
        // bottom node
        this.nodesVecs.push(new Vector3(pos.x, pos.y - radius, pos.z));
        this.nodes.push(new VerletNode(new Vector3(pos.x, pos.y - radius, pos.z), .01, new THREE.Color(0), GeometryDetail.ICOSA));
        this.nodesOrig.push(new VerletNode(new Vector3(pos.x, pos.y - radius, pos.z), .01, new THREE.Color(0), GeometryDetail.ICOSA));

        // add nodes and sticks to group
        if (!this.isGrowable) { // add at contruction is no growable
            for (var n of this.nodes) {
                this.add(n);
            }
        }

        this.tetraTendrils.push(new VerletStrand(this.nodes[0].position, this.nodes[1].position, 12, AnchorPoint.HEAD_TAIL,
            .725, GeometryDetail.TRI));
        this.tetraTendrils.push(new VerletStrand(this.nodes[0].position, this.nodes[2].position, 12, AnchorPoint.HEAD_TAIL,
            .725, GeometryDetail.TRI));
        this.tetraTendrils.push(new VerletStrand(this.nodes[0].position, this.nodes[3].position, 12, AnchorPoint.HEAD_TAIL,
            .725, GeometryDetail.TRI));
        this.tetraTendrils.push(new VerletStrand(this.nodes[4].position, this.nodes[1].position, 12, AnchorPoint.HEAD_TAIL,
            .725, GeometryDetail.TRI));
        this.tetraTendrils.push(new VerletStrand(this.nodes[4].position, this.nodes[2].position, 12, AnchorPoint.HEAD_TAIL,
            .725, GeometryDetail.TRI));
        this.tetraTendrils.push(new VerletStrand(this.nodes[4].position, this.nodes[3].position, 12, AnchorPoint.HEAD_TAIL,
            .725, GeometryDetail.TRI));
        this.tetraTendrils.push(new VerletStrand(this.nodes[1].position, this.nodes[2].position, 12, AnchorPoint.HEAD_TAIL,
            .725, GeometryDetail.TRI));
        this.tetraTendrils.push(new VerletStrand(this.nodes[2].position, this.nodes[3].position, 12, AnchorPoint.HEAD_TAIL,
            .725, GeometryDetail.TRI));
        this.tetraTendrils.push(new VerletStrand(this.nodes[3].position, this.nodes[1].position, 12, AnchorPoint.HEAD_TAIL,
            .725, GeometryDetail.TRI));
        this.tetraTendrils.push(new VerletStrand(this.nodes[0].position, this.nodes[4].position, 12, AnchorPoint.HEAD_TAIL,
            .725, GeometryDetail.TRI));

        // add tendrils to group
        if (!this.isGrowable) { // add at contruction is no growable
            for (var t of this.tetraTendrils) {
                this.add(t);
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
                this.add(this.tetraTendrils[this.inputCounter - 1]);
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
            n.rotateY(this.theta);
        }
        //this.theta += Math.PI / 1440;

        let heads = [0, 0, 0, 4, 4, 4, 1, 2, 3, 0];
        let tails = [1, 2, 3, 1, 2, 3, 2, 3, 1, 4];
        for (var i = 0; i < this.tetraTendrils.length; i++) {
            this.tetraTendrils[i].setHeadPosition(this.nodes[heads[i]].position);
            this.tetraTendrils[i].setTailPosition(this.nodes[tails[i]].position);
            this.tetraTendrils[i].setStrandMaterials(new THREE.Color(0xFF5500), .45);
        }

        for (var t of this.tetraTendrils) {
            t.verlet();
        }
    }

    setNodesGeom(geom: GeometryDetail): void {
        for (var n of this.nodes) {
            //to do
        }
    }

    setNodesColor(color: THREE.Color): void {
        for (var n of this.nodes) {
            n.setNodeColor(color);
        }
    }

    setSticksColor(color: THREE.Color): void {
        for (var s of this.sticks) {
            s.setColor(color);
        }
    }

    setSticksOpacity(alpha: number): void {
        for (var s of this.sticks) {
            s.setOpacity(alpha);
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

    constrain(bounds: Vector3, offset: Vector3 = new Vector3()): void {
        for (var s of this.sticks) {
            s.constrainLen();
        }
        let v = new Vector3(bounds.x + offset.x, bounds.y + offset.y, bounds.z + offset.z);
        for (var n of this.nodes) {
            n.constrainBounds(v);
        }

        for (var t of this.tetraTendrils) {
            t.constrainBounds(v);
        }
    }
}