// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall

// Creates Jellyfish like epidermal hood, powered by verlet strands

import * as THREE from '/build/three.module.js';
import { VerletNode } from './VerletNode.js';
import { VerletStick } from './VerletStick.js';
import { VerletStrand } from './VerletStrand.js';
import { AnchorPoint, Propulsion, VerletMaterials } from './IJGUtils.js';
import { Vector3 } from '/build/three.module.js';
//import { Vector3 } from '/build/three.module.js';

export class EpidermalHood extends THREE.Group {

    pos: THREE.Vector3;
    radius: number = 0.0;
    height: number = 0.0;
    spineCount: number = 12;
    sliceCount: number = 12;
    constraintFactor: number;

    // down spines
    spines: VerletStrand[];

    // cross slices
    slices: VerletStick[];
    sliceLines: THREE.Line[];
    sliceGeoms: THREE.Geometry[];
    sliceMats: THREE.MeshBasicMaterial[];

    // hanging tendrils
    hasTendrils: boolean;
    tendrils: VerletStrand[];
    tendrilSegments: number = 0.0;
    tendrilLength: number = 0.0;
    tendrilTension: number = 0.0;

    // Cilia
    hasCilia: boolean;
    cilia: VerletStrand[] = new Array();
    ciliaSegments: number = 0.0;
    cilialLength: number = 0.0;
    ciliaTension: number = 0.0;

    verletMaterials: VerletMaterials;

    // dynamics
    // Propulsion object includes: direction, force, frequency
    dynamics: Propulsion;
    private dynamicsThetas: THREE.Vector3 = new THREE.Vector3(0.0, 0.0, 0.0);
    // leader: THREE.Vector3;


    constructor(position: THREE.Vector3, radius: number, height: number, spineCount: number, sliceCount: number, constraintFactor: number) {
        super();
        this.hasTendrils = false;
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


        // cilia
        this.hasCilia = false;


        this.dynamics = new Propulsion();

        // materials
        this.verletMaterials = new VerletMaterials();

        // instantiate hanging tendrils array
        this.tendrils = new Array(spineCount);

        // construct hood
        this.constructHood();
    }

    // not attaching???
    addCilia(ciliaSegments: number = 0.0, cilialLength: number = 0.0, ciliaTension: number) {
        let ciliaNodes: VerletNode[] = this.getSpineNodes();

        this.hasCilia = true;
        for (var i = 0; i < this.spines.length; i++) {
            for (var j = 0; j < this.spines[i].nodes.length; j++) {
                let k = this.spines[i].nodes.length * i + j;
                let cil = new VerletStrand(ciliaNodes[k].position,
                    new THREE.Vector3(ciliaNodes[k].position.x, ciliaNodes[k].position.y + .02, ciliaNodes[k].position.z),
                    ciliaSegments, AnchorPoint.TAIL, this.ciliaTension);
                this.cilia.push(cil);
                // cilialLength: number = 0.0;
                // ciliaTension: number = 0.0;
                this.add(this.cilia[k]);
            }
        }
    }

    addHangingTendrils(tendrilSegments: number = 20, tendrilLength: number = .3, tendrilTension: number = 0.95): void {

        let tendrilNodes: VerletNode[] = this.getBaseNodes();

        this.hasTendrils = true; // useful if I want oeventually remove dynamically
        //console.log(this.hasTendrils);
        this.tendrilSegments = tendrilSegments; // don't really need to retain this.
        this.tendrilLength = tendrilLength;
        this.tendrilTension = tendrilTension;
        for (var i = 0; i < this.spines.length; i++) {
            // console.log(tendrilNodes[i].position);
            this.tendrils[i] = new VerletStrand(
                tendrilNodes[i].position,
                new Vector3(tendrilNodes[i].position.x, tendrilNodes[i].position.y - tendrilLength, tendrilNodes[i].position.z),

                this.tendrilSegments,
                AnchorPoint.HEAD,
                this.tendrilTension
            );

            this.add(this.tendrils[i]);
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

    setDynamics(dynamics: Propulsion): void {
        this.dynamics = dynamics;
    }

    setMaterials(verletMaterials: VerletMaterials): void {
        this.verletMaterials = verletMaterials;
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].setMaterials(this.verletMaterials.spineColor, this.verletMaterials.spineAlpha, this.verletMaterials.nodeColor);

            if (this.hasTendrils) {
                this.tendrils[i].setMaterials(this.verletMaterials.tendrilColor, this.verletMaterials.tendrilAlpha, this.verletMaterials.nodeColor);
            }
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

    setNodesVisible(areSpineNodesVisible: boolean, areTendrilNodesVisible: boolean): void {
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].setNodesVisible(areSpineNodesVisible);
        }
        for (var i = 0; i < this.tendrils.length; i++) {
            this.tendrils[i].setNodesVisible(areTendrilNodesVisible);
        }
    }

    // Returns base nodes for tendril attachment
    getBaseNodes(): VerletNode[] {
        let baseNodes: VerletNode[] = new Array(this.spineCount);
        for (var i = 0; i < this.spines.length; i++) {
            baseNodes[i] = this.spines[i].nodes[0];
        }
        return baseNodes;

    }

    // Returns all spine nodes for cilia attachment
    getSpineNodes(): VerletNode[] {
        let spineNodes: VerletNode[] = new Array();
        for (var i = 0; i < this.spines.length; i++) {
            for (var j = 0; j < this.spines[i].nodes.length; j++) {
                spineNodes.push(this.spines[i].nodes[j]);
            }
        }
        return spineNodes;

    }

    getApex(): THREE.Vector3 {
        return this.spines[0].nodes[this.spines[0].nodes.length - 1].position.clone();
    }

    public pulse(): void {
        // console.log(this.hasTendrils);
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].verlet();
            if (this.hasTendrils) {
                this.tendrils[i].verlet();
                this.tendrils[i].nodes[0].position.x = this.spines[i].nodes[1].position.x;
                this.tendrils[i].nodes[0].position.y = this.spines[i].nodes[1].position.y;
                this.tendrils[i].nodes[0].position.z = this.spines[i].nodes[1].position.z;
            }

            this.spines[i].nodes[this.spines[i].nodes.length - 1].position.y = this.pos.y + this.height + Math.sin(this.dynamicsThetas.y) * this.dynamics.force.y;

            this.spines[i].nodes[0].position.y = this.pos.y + Math.cos(this.dynamicsThetas.y) * this.dynamics.force.y * .5;
            this.dynamicsThetas.add(this.dynamics.frequency);
        }

        for (var i = 0; i < this.slices.length; i++) {
            this.slices[i].constrainLen();
            this.sliceLines[i].geometry.verticesNeedUpdate = true;
        }

        if (this.hasCilia) {
            for (var i = 0; i < this.spines.length; i++) {
                for (var j = 0; j < this.spines[i].nodes.length; j++) {
                    let k = this.cilia[i].nodes.length * i + j;
                    this.cilia[k].verlet();
                    this.cilia[k].nodes[0].position.x = this.spines[i].nodes[j].position.x;
                    this.cilia[k].nodes[0].position.y = this.spines[i].nodes[j].position.y;
                    this.cilia[k].nodes[0].position.z = this.spines[i].nodes[j].position.z;
                }
            }

        }
    }

    public follow(apex: THREE.Vector3): void {
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].verlet();
            if (this.hasTendrils) {
                this.tendrils[i].verlet();
                this.tendrils[i].nodes[0].position.x = this.spines[i].nodes[1].position.x;
                this.tendrils[i].nodes[0].position.y = this.spines[i].nodes[1].position.y;
                this.tendrils[i].nodes[0].position.z = this.spines[i].nodes[1].position.z;
            }


            this.spines[i].nodes[this.spines[i].nodes.length - 1].position.y = this.pos.y + apex.y;
            this.spines[i].nodes[0].position.y = this.pos.y - this.height + apex.y;

            // this.spines[i].nodes[0].position.y = this.pos.y + Math.cos(this.dynamicsThetas.y) * this.dynamics.force.y * .5;
            // this.dynamicsThetas.add(this.dynamics.frequency);
        }

        for (var i = 0; i < this.slices.length; i++) {
            this.slices[i].constrainLen();
            this.sliceLines[i].geometry.verticesNeedUpdate = true;
        }

        if (this.hasCilia) {
            for (var i = 0; i < this.spines.length; i++) {
                for (var j = 0; j < this.spines[i].nodes.length; j++) {
                    let k = this.cilia[i].nodes.length * i + j;
                    this.cilia[k].verlet();
                    this.cilia[k].nodes[0].position.x = this.spines[i].nodes[j].position.x;
                    this.cilia[k].nodes[0].position.y = this.spines[i].nodes[j].position.y;
                    this.cilia[k].nodes[0].position.z = this.spines[i].nodes[j].position.z;
                }
            }
        }
    }

    public constrainBounds(bounds: THREE.Vector3): void {
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].constrainBounds(bounds);

        }
    }



}