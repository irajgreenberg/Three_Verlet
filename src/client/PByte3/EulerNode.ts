// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall

// Simple Euler node
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------

import * as THREE from 'three';

export class EulerNode extends THREE.Mesh {

    speed: THREE.Vector3;
    radius: number; //for convenience
    theta: number = 0;

    constructor(pos: THREE.Vector3, radius: number = 0.005, speed: THREE.Vector3 = new THREE.Vector3()) {
        super(new THREE.SphereBufferGeometry(radius), new THREE.MeshBasicMaterial({ color: 0xCC4444 }));
        this.radius = radius;
        this.speed = speed;
        this.position.set(pos.x, pos.y, pos.z);
    }

    // Motion determined by position comparison between current and previus frames
    move(): void {
        let temp = new THREE.Vector3(this.speed.x+Math.sin(this.theta)*THREE.MathUtils.randFloat(.001, .005), this.speed.y+Math.sin(this.theta)*THREE.MathUtils.randFloat(.001, .005), this.speed.z+Math.sin(this.theta)*THREE.MathUtils.randFloat(.0001, .001));
        this.position.add(temp);
        this.theta += Math.PI/THREE.MathUtils.randFloat(2, 10);
    }

    constrainBounds(bounds: THREE.Vector3): void {
        if (this.position.x > bounds.x / 2 - this.radius) {
            this.position.x = bounds.x / 2 - this.radius;
            this.speed.x *= -1;
        } else if (this.position.x < -bounds.x / 2 + this.radius) {
            this.position.x = -bounds.x / 2 + this.radius;
            this.speed.x *= -1;
        }

        if (this.position.y > bounds.y / 2 - this.radius) {
            this.position.y = bounds.y / 2 - this.radius;
            this.speed.y *= -1;
        } else if (this.position.y < -bounds.y / 2 + this.radius) {
            this.position.y = -bounds.y / 2 + this.radius;
            this.speed.y *= -1;
        }

        if (this.position.z > bounds.z / 2 - this.radius) {
            this.position.z = bounds.z / 2 - this.radius;
            this.speed.z *= -1;
        } else if (this.position.z < -bounds.z / 2 + this.radius) {
            this.position.z = -bounds.z / 2 + this.radius;
            this.speed.z *= -1;
        }

    }
}