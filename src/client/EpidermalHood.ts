// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall

// Creates Jellyfish like epidermal hood, powered by verlet strands

import * as THREE from '/build/three.module.js';
import { VerletStick } from './VerletStick.js';
import { VerletStrand } from './VerletStrand.js';
import { AnchorPoint, Propulsion, VerletMaterials } from './IJGUtils.js';
//import { Vector3 } from '/build/three.module.js';

export class EpidermalHood extends THREE.Group {

    pos: THREE.Vector3;
    radius: number = 0.0;
    height: number = 0.0;
    spineCount: number = 12;
    sliceCount: number = 12;
    constraintFactor: number;

    spines: VerletStrand[];
    // slices
    slices: VerletStick[];
    sliceLines: THREE.Line[];
    sliceGeoms: THREE.Geometry[];
    sliceMats: THREE.MeshBasicMaterial[];

    verletMaterials: VerletMaterials;


    // dynamics
    // Propulsion object includes: direction, force, frequency
    dynamics: Propulsion;
    private dynamicsThetas: THREE.Vector3 = new THREE.Vector3(0.0, 0.0, 0.0);
    // leader: THREE.Vector3;


    constructor(position: THREE.Vector3, radius: number, height: number, spineCount: number, sliceCount: number, constraintFactor: number) {
        super();
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

        // materials
        this.verletMaterials = new VerletMaterials();

        // construct hood
        this.constructHood();
    }

    setDynamics(dynamics: Propulsion): void {
        this.dynamics = dynamics;
    }

    setMaterials(verletMaterials: VerletMaterials): void {
        this.verletMaterials = verletMaterials;
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].setMaterials(this.verletMaterials.spineColor, this.verletMaterials.spineAlpha, this.verletMaterials.nodeColor);
        }
        for (var i = 0; i < this.slices.length; i++) {
            this.sliceLines[i].material.color = this.verletMaterials.sliceColor;
            this.sliceLines[i].material.opacity = this.verletMaterials.sliceAlpha;
            this.sliceLines[i].material.transparent = true;
        }
    }

    setNodesScale(scale: number, isRandom: boolean = false) {
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].setNodesScale(scale);
        }
    }

    private constructHood(): void {
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
                const y = this.spines[i].nodes[j].position.y
                const z = Math.cos(phi) * this.spines[i].nodes[j].position.z - Math.sin(phi) * this.spines[i].nodes[j].position.x;

                this.spines[i].nodes[j].position.x = x;
                this.spines[i].nodes[j].position.y = y;
                this.spines[i].nodes[j].position.z = z;

                this.spines[i].resetVerlet();

                // create slices
                if (i > 0) {
                    this.sliceGeoms[k] = new THREE.Geometry();
                    this.sliceMats[k] = new THREE.MeshBasicMaterial({ color: this.verletMaterials.sliceColor });
                    this.sliceMats[k].transparent = true;
                    this.sliceMats[k].opacity = this.verletMaterials.sliceAlpha;

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
                    this.sliceMats[k] = new THREE.MeshBasicMaterial({ color: this.verletMaterials.sliceColor });
                    this.sliceMats[k].transparent = true; //annoying ide can't accurately track this
                    this.sliceMats[k].opacity = this.verletMaterials.sliceAlpha;


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
    }

    getApex(): THREE.Vector3 {
        return this.spines[0].nodes[this.spines[0].nodes.length - 1].position.clone();
    }

    public pulse(): void {
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

    public follow(apex: THREE.Vector3): void {
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

    public constrainBounds(bounds: THREE.Vector3): void {
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].constrainBounds(bounds);

        }
    }



}