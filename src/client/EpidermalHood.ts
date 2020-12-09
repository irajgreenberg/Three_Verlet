// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall

// Creates Jellyfish like epidermal hood, powered by verlet strands

import * as THREE from '/build/three.module.js';
import { VerletStick } from './VerletStick.js';
import { VerletStrand } from './VerletStrand.js';
import { AnchorPoint } from './IJGUtils.js';

export class EpidermalHood extends THREE.Group {

    radius: number = 0.0;
    height: number = 0.0;
    spineCount: number = 12;
    sliceCount: number = 12;
    spines: VerletStrand[];
    //slices: VerletStrand[];
    // sliceSticks:THREE.Line[];
    //sticks: VerletStick[];
    //drawnStick: THREE.Line = new THREE.Line;


    // test
    // sliceSticks:THREE.Line[];
    slices: VerletStick[];
    sliceLines: THREE.Line[];
    sliceGeoms: THREE.Geometry[];
    sliceMats: THREE.MeshBasicMaterial[];


    // dynamics
    propulsionVec: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
    propulsionForce: THREE.Vector3 = new THREE.Vector3(0, .1, 0);
    propulsionFreq: THREE.Vector3 = new THREE.Vector3(0, Math.PI / 25, 0);
    thetaPulse: number = 0.0;


    constructor(radius: number, height: number, spineCount: number, sliceCount: number) {
        super();
        this.radius = radius;
        this.height = height;
        this.spineCount = spineCount;
        this.sliceCount = sliceCount;
        this.spines = new Array(spineCount);

        // drawing slices test
        this.slices = new Array(sliceCount * spineCount);
        this.sliceLines = new Array(sliceCount * spineCount);
        this.sliceGeoms = new Array(sliceCount * spineCount);
        this.sliceMats = new Array(sliceCount * spineCount);

        // construct hood
        this.constructHood();
    }

    private constructHood(): void {
        let phi = 0.0; // rotation around Y-axis
        let k = 0; // poorly named slice counter
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i] = new VerletStrand(new THREE.Vector3(), new THREE.Vector3(), this.sliceCount, AnchorPoint.HEAD_TAIL, .2);
            let theta = 0.0; // rotation around Z-axis
            for (var j = 0; j < this.sliceCount + 1; j++) {
                this.spines[i].nodes[j].position.x = Math.cos(theta) * this.radius;
                this.spines[i].nodes[j].position.y = Math.sin(theta) * this.radius;
                this.spines[i].nodes[j].position.z = 0.0;
                theta += (Math.PI / 2) / this.sliceCount;

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
    }

    public pulse(): void {
        for (var i = 0; i < this.spines.length; i++) {
            this.spines[i].verlet();

            this.spines[i].nodes[this.spines[i].nodes.length - 1].position.y = this.height + Math.sin(this.thetaPulse) * .065;
            this.spines[i].nodes[0].position.y = Math.cos(this.thetaPulse) * .015;
            this.thetaPulse += Math.PI / 1400;
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