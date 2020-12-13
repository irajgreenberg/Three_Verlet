// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall
// Creates Jellyfish like epidermal hood, powered by verlet strands
import * as THREE from '/build/three.module.js';
import { VerletStick } from './VerletStick.js';
import { VerletStrand } from './VerletStrand.js';
import { AnchorPoint, Propulsion, VerletMaterials } from './IJGUtils.js';
import { Vector3 } from '/build/three.module.js';
//import { Vector3 } from '/build/three.module.js';
export class EpidermalHood extends THREE.Group {
    // leader: THREE.Vector3;
    constructor(position, radius, height, spineCount, sliceCount, constraintFactor) {
        super();
        this.radius = 0.0;
        this.height = 0.0;
        this.spineCount = 12;
        this.sliceCount = 12;
        this.tendrilSegments = 0.0;
        this.tendrilLength = 0.0;
        this.tendrilTension = 0.0;
        this.ciliaSegments = 0.0;
        this.cilialLength = 0.0;
        this.ciliaTension = 0.0;
        this.dynamicsThetas = new THREE.Vector3(0.0, 0.0, 0.0);
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
        this.cilia = new Array(spineCount * (sliceCount + 1));
        this.dynamics = new Propulsion();
        // materials
        this.verletMaterials = new VerletMaterials();
        // instantiate hanging tendrils array
        this.tendrils = new Array(spineCount);
        // construct hood
        this.constructHood();
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
    // Cilia
    addCilia(ciliaSegments = 0.0, cilialLength = 0.0, ciliaTension) {
        let ciliaNodes = this.getSpineNodes();
        this.ciliaSegments = ciliaSegments;
        this.cilialLength = cilialLength;
        this.ciliaTension = ciliaTension;
        this.hasCilia = true;
        for (var i = 0; i < this.spines.length; i++) {
            for (var j = 0; j < this.spines[i].nodes.length; j++) {
                let k = this.spines[i].nodes.length * i + j;
                let vec = ciliaNodes[k].position.clone();
                vec.normalize();
                vec.multiplyScalar(this.cilialLength);
                this.cilia[k] = new VerletStrand(ciliaNodes[k].position, new THREE.Vector3(ciliaNodes[k].position.x - vec.x, ciliaNodes[k].position.y - vec.y, ciliaNodes[k].position.z - vec.z), ciliaSegments, AnchorPoint.HEAD, this.ciliaTension);
                this.add(this.cilia[k]);
            }
        }
    }
    // Tendrils
    addHangingTendrils(tendrilSegments = 20, tendrilLength = .3, tendrilTension = 0.95) {
        let tendrilNodes = this.getBaseNodes();
        this.hasTendrils = true; // useful if I want oeventually remove dynamically
        //console.log(this.hasTendrils);
        this.tendrilSegments = tendrilSegments; // don't really need to retain this.
        this.tendrilLength = tendrilLength;
        this.tendrilTension = tendrilTension;
        for (var i = 0; i < this.spines.length; i++) {
            // console.log(tendrilNodes[i].position);
            this.tendrils[i] = new VerletStrand(tendrilNodes[i].position, new Vector3(tendrilNodes[i].position.x, tendrilNodes[i].position.y - tendrilLength, tendrilNodes[i].position.z), this.tendrilSegments, AnchorPoint.HEAD, this.tendrilTension);
            this.add(this.tendrils[i]);
        }
    }
    setDynamics(dynamics) {
        this.dynamics = dynamics;
    }
    setMaterials(verletMaterials) {
        this.verletMaterials = verletMaterials;
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].setMaterials(this.verletMaterials.spineColor, this.verletMaterials.spineAlpha, this.verletMaterials.spineNodeColor);
            if (this.hasTendrils) {
                this.tendrils[i].setMaterials(this.verletMaterials.tendrilColor, this.verletMaterials.tendrilAlpha, this.verletMaterials.tendrilNodeColor);
            }
        }
        for (var i = 0; i < this.slices.length; i++) {
            this.sliceLines[i].material.color = this.verletMaterials.sliceColor;
            this.sliceLines[i].material.opacity = this.verletMaterials.sliceAlpha;
            this.sliceLines[i].material.transparent = true;
        }
        for (var i = 0; i < this.cilia.length; i++) {
            if (this.hasCilia) {
                this.cilia[i].setMaterials(this.verletMaterials.ciliaColor, this.verletMaterials.ciliaAlpha, this.verletMaterials.ciliaNodeColor);
            }
        }
    }
    setNodesScale(hoodNodeScale = 1.0, tendrilNodeScale = 1.0, ciliaNodeScale = 1.0, isNodeScaleRandom = false) {
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].setNodesScale(hoodNodeScale);
        }
        if (this.hasTendrils) {
            for (var i = 0; i < this.tendrils.length; i++) {
                this.tendrils[i].setNodesScale(tendrilNodeScale);
            }
        }
        if (this.hasCilia) {
            for (var i = 0; i < this.cilia.length; i++) {
                this.cilia[i].setNodesScale(ciliaNodeScale);
            }
        }
    }
    setNodesVisible(areSpineNodesVisible = true, areTendrilNodesVisible = true, areCiliaNodesVisible = true) {
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].setNodesVisible(areSpineNodesVisible);
        }
        for (var i = 0; i < this.tendrils.length; i++) {
            this.tendrils[i].setNodesVisible(areTendrilNodesVisible);
        }
        if (this.hasCilia) {
            for (var i = 0; i < this.cilia.length; i++) {
                this.cilia[i].setNodesVisible(areCiliaNodesVisible);
            }
        }
    }
    // Returns base nodes for tendril attachment
    getBaseNodes() {
        let baseNodes = new Array(this.spineCount);
        for (var i = 0; i < this.spines.length; i++) {
            baseNodes[i] = this.spines[i].nodes[0];
        }
        return baseNodes;
    }
    // Returns all spine nodes for cilia attachment
    getSpineNodes() {
        let spineNodes = new Array(this.spines.length * (this.sliceCount = 1));
        for (var i = 0; i < this.spines.length; i++) {
            for (var j = 0; j < this.spines[i].nodes.length; j++) {
                let k = this.spines[i].nodes.length * i + j;
                spineNodes[k] = this.spines[i].nodes[j];
            }
        }
        return spineNodes;
    }
    getApex() {
        return this.spines[0].nodes[this.spines[0].nodes.length - 1].position.clone();
    }
    pulse() {
        // Tendrils and Spines
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
        // slices
        for (var i = 0; i < this.slices.length; i++) {
            this.slices[i].constrainLen();
            this.sliceLines[i].geometry.verticesNeedUpdate = true;
        }
        // Cilia
        for (var i = 0; i < this.spines.length; i++) {
            for (var j = 0; j < this.spines[i].nodes.length; j++) {
                let k = this.spines[i].nodes.length * i + j;
                if (this.hasCilia) {
                    this.cilia[k].verlet();
                    this.cilia[k].nodes[0].position.x = this.spines[i].nodes[j].position.x;
                    this.cilia[k].nodes[0].position.y = this.spines[i].nodes[j].position.y;
                    this.cilia[k].nodes[0].position.z = this.spines[i].nodes[j].position.z;
                }
            }
        }
    }
    follow(apex) {
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
        for (var i = 0; i < this.spines.length; i++) {
            for (var j = 0; j < this.spines[i].nodes.length; j++) {
                let k = this.spines[i].nodes.length * i + j;
                if (this.hasCilia) {
                    this.cilia[k].verlet();
                    this.cilia[k].nodes[0].position.x = this.spines[i].nodes[j].position.x;
                    this.cilia[k].nodes[0].position.y = this.spines[i].nodes[j].position.y;
                    this.cilia[k].nodes[0].position.z = this.spines[i].nodes[j].position.z;
                }
            }
        }
    }
    constrainBounds(bounds) {
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].constrainBounds(bounds);
        }
    }
}
