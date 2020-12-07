// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall

// Creates Jellyfish like epidermal hood, powered by verlet strands

import * as THREE from '/build/three.module.js';
//import { VerletNode } from './VerletNode.js';
import { AnchorPoint, VerletStrand } from './VerletStrand.js';

export class EpidermalHood extends THREE.Group {

    radius: number = 0.0;
    height: number = 0.0;
    spineCount: number = 12;
    sliceCount: number = 12;
    spines: VerletStrand[];
    
    // dynamics
    propulsionVec: THREE.Vector3 = new THREE.Vector3(0,1,0);
    propulsionForce: THREE.Vector3 = new THREE.Vector3(0, .1, 0);
    propulsionFreq: THREE.Vector3 = new THREE.Vector3(0,Math.PI/25,0);
    //theta: Number = 0.0;


    constructor(radius: number, height: number, spineCount: number, sliceCount: number) {
        super();
        this.radius = radius;
        this.height = height;
        this.spineCount = spineCount;
        this.sliceCount = sliceCount;
        this.spines = new Array(spineCount);

        // construct hood
        this.constructHood();
    }

    private constructHood():void{
        // rotate half dome around z-axis
        let phi = 0.0;
        for(var i=0; i<this.spines.length; i++) {
            this.spines[i] = new VerletStrand(new THREE.Vector3(), new THREE.Vector3(), this.sliceCount, AnchorPoint.TAIL, .5 + Math.random()*.475);
            let theta = 0.0;
            for(var j=0; j<this.sliceCount+1; j++) {
                this.spines[i].nodes[j].position.x = Math.cos(theta)*this.radius;
                this.spines[i].nodes[j].position.y = Math.sin(theta)*this.radius;
                this.spines[i].nodes[j].position.z =0.0; 
                theta += (Math.PI/2)/this.sliceCount;

                const x = Math.sin(phi)*this.spines[i].nodes[j].position.z + Math.cos(phi)*this.spines[i].nodes[j].position.x;
                const y = this.spines[i].nodes[j].position.y
                const z = Math.cos(phi)*this.spines[i].nodes[j].position.z - Math.sin(phi)*this.spines[i].nodes[j].position.x;

                this.spines[i].nodes[j].position.x = x;
                this.spines[i].nodes[j].position.y = y;
                this.spines[i].nodes[j].position.z = z;
            }
            phi += Math.PI*2/this.spines.length;
            this.spines[i].resetVerlet();
            this.add(this.spines[i]);
        }
    }

    public pulse():void {
        for(var i=0; i<this.spines.length; i++) {
            this.spines[i].verlet();
        }
    }

    public constrainBounds(bounds:THREE.Vector3):void {
        for(var i=0; i<this.spines.length; i++) {
            this.spines[i].constrainBounds(bounds);
        }
    }



}