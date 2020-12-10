// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall
// Creates Jellyfish like epidermal hood, powered by verlet strands
import * as THREE from '/build/three.module.js';
import { VerletStick } from './VerletStick.js';
import { VerletStrand } from './VerletStrand.js';
import { AnchorPoint, Propulsion } from './IJGUtils.js';
//import { Vector3 } from '/build/three.module.js';
export class EpidermalHood extends THREE.Group {
    // leader: THREE.Vector3;
    constructor(position, radius, height, spineCount, sliceCount, constraintFactor) {
        super();
        this.radius = 0.0;
        this.height = 0.0;
        this.spineCount = 12;
        this.sliceCount = 12;
        this.dynamicsThetas = new THREE.Vector3(0.0, 0.0, 0.0);
        this.pos = position;
        this.radius = radius;
        this.height = height;
        this.spineCount = spineCount;
        this.sliceCount = sliceCount;
        this.constraintFactor = constraintFactor;
        this.spines = new Array(spineCount);
        // slices
        this.slices = new Array(sliceCount * spineCount);
        this.sliceLines = new Array(sliceCount * spineCount);
        this.sliceGeoms = new Array(sliceCount * spineCount);
        this.sliceMats = new Array(sliceCount * spineCount);
        this.dynamics = new Propulsion();
        // construct hood
        this.constructHood();
    }
    setDynamics(dynamics) {
        this.dynamics = dynamics;
    }
    constructHood() {
        let phi = 0.0; // rotation around Y-axis
        let k = 0; // poorly named slice counter
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i] = new VerletStrand(new THREE.Vector3(), new THREE.Vector3(), this.sliceCount, AnchorPoint.HEAD_TAIL, this.constraintFactor);
            let theta = 0.0; // rotation around Z-axis
            for (var j = 0; j < this.sliceCount + 1; j++) {
                // plot around z-axis
                this.spines[i].nodes[j].position.x = this.pos.x + Math.cos(theta) * this.radius;
                this.spines[i].nodes[j].position.y = this.pos.y + Math.sin(theta) * this.height;
                this.spines[i].nodes[j].position.z = this.pos.z;
                theta += (Math.PI / 2) / this.sliceCount;
                // plot around y-axis
                const x = Math.sin(phi) * this.spines[i].nodes[j].position.z + Math.cos(phi) * this.spines[i].nodes[j].position.x;
                const y = this.spines[i].nodes[j].position.y;
                const z = Math.cos(phi) * this.spines[i].nodes[j].position.z - Math.sin(phi) * this.spines[i].nodes[j].position.x;
                this.spines[i].nodes[j].position.x = x;
                this.spines[i].nodes[j].position.y = y;
                this.spines[i].nodes[j].position.z = z;
                this.spines[i].resetVerlet();
                // create slices
                if (i > 0) {
                    this.sliceGeoms[k] = new THREE.Geometry();
                    this.sliceMats[k] = new THREE.MeshBasicMaterial({ color: 0xFF8800 });
                    this.sliceMats[k].transparent = true;
                    this.sliceMats[k].opacity = .25;
                    this.slices[k] = new VerletStick(this.spines[i - 1].nodes[j], this.spines[i].nodes[j]);
                    this.sliceGeoms[k].vertices.push(this.slices[k].start.position);
                    this.sliceGeoms[k].vertices.push(this.slices[k].end.position);
                    this.sliceLines[k] = new THREE.Line(this.sliceGeoms[k], this.sliceMats[k]);
                    this.add(this.sliceLines[k]);
                    k++;
                }
                // close hood
                if (i === this.spines.length - 1) {
                    this.sliceGeoms[k] = new THREE.Geometry();
                    this.sliceMats[k] = new THREE.MeshBasicMaterial({ color: 0xFF8800 });
                    this.sliceMats[k].transparent = true; //annoying ide can't accurately track this
                    this.sliceMats[k].opacity = .25;
                    // this.slices[k] = new VerletStick(this.spines[i-1].nodes[j], this.spines[i].nodes[j], .4, AnchorPoint.TAIL);
                    this.slices[k] = new VerletStick(this.spines[i].nodes[j], this.spines[0].nodes[j]);
                    this.sliceGeoms[k].vertices.push(this.slices[k].start.position);
                    this.sliceGeoms[k].vertices.push(this.slices[k].end.position);
                    this.sliceLines[k] = new THREE.Line(this.sliceGeoms[k], this.sliceMats[k]);
                    this.add(this.sliceLines[k]);
                    k++;
                }
            }
            phi += Math.PI * 2 / this.spines.length;
            //this.spines[i].resetVerlet();
            this.add(this.spines[i]);
        }
        // set leader to Hood apex;
        // this.leader = this.spines[0].nodes[this.spines[0].nodes.length - 1].position;
    }
    getApex() {
        return this.spines[0].nodes[this.spines[0].nodes.length - 1].position;
    }
    pulse() {
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].verlet();
            this.spines[i].nodes[this.spines[i].nodes.length - 1].position.y = this.pos.y + this.height + Math.sin(this.dynamicsThetas.y) * this.dynamics.force.y;
            this.spines[i].nodes[0].position.y = this.pos.y + Math.cos(this.dynamicsThetas.y) * this.dynamics.force.y * .5;
            this.dynamicsThetas.add(this.dynamics.frequency);
        }
        for (var i = 0; i < this.slices.length; i++) {
            this.slices[i].constrainLen();
            this.sliceLines[i].geometry.verticesNeedUpdate = true;
        }
    }
    follow(apex) {
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].verlet();
            this.spines[i].nodes[this.spines[i].nodes.length - 1].position.y = this.pos.y + apex.y;
            this.spines[i].nodes[0].position.y = this.pos.y - this.height + apex.y;
            // this.spines[i].nodes[0].position.y = this.pos.y + Math.cos(this.dynamicsThetas.y) * this.dynamics.force.y * .5;
            // this.dynamicsThetas.add(this.dynamics.frequency);
        }
        for (var i = 0; i < this.slices.length; i++) {
            this.slices[i].constrainLen();
            this.sliceLines[i].geometry.verticesNeedUpdate = true;
        }
    }
    constrainBounds(bounds) {
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].constrainBounds(bounds);
        }
    }
}
