// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall
// Simple Euler node
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------
//import { Mesh, Vector3, SphereBufferGeometry, MeshBasicMaterial, MathUtils } from 'three';
import { Mesh, Vector3, SphereBufferGeometry, MeshBasicMaterial, MathUtils } from '/build/three.module.js';
export class EulerNode extends Mesh {
    constructor(pos, radius = 0.005, speed = new Vector3()) {
        super(new SphereBufferGeometry(radius), new MeshBasicMaterial({ color: 0xCC4444 }));
        this.theta = 0;
        this.radius = radius;
        this.speed = speed;
        this.position.set(pos.x, pos.y, pos.z);
    }
    // Motion determined by position comparison between current and previus frames
    move() {
        let temp = new Vector3(this.speed.x + Math.sin(this.theta) * MathUtils.randFloat(.001, .005), this.speed.y + Math.sin(this.theta) * MathUtils.randFloat(.001, .005), this.speed.z + Math.sin(this.theta) * MathUtils.randFloat(.0001, .001));
        this.position.add(temp);
        this.theta += Math.PI / MathUtils.randFloat(2, 10);
    }
    constrainBounds(bounds) {
        if (this.position.x > bounds.x / 2 - this.radius) {
            this.position.x = bounds.x / 2 - this.radius;
            this.speed.x *= -1;
        }
        else if (this.position.x < -bounds.x / 2 + this.radius) {
            this.position.x = -bounds.x / 2 + this.radius;
            this.speed.x *= -1;
        }
        if (this.position.y > bounds.y / 2 - this.radius) {
            this.position.y = bounds.y / 2 - this.radius;
            this.speed.y *= -1;
        }
        else if (this.position.y < -bounds.y / 2 + this.radius) {
            this.position.y = -bounds.y / 2 + this.radius;
            this.speed.y *= -1;
        }
        if (this.position.z > bounds.z / 2 - this.radius) {
            this.position.z = bounds.z / 2 - this.radius;
            this.speed.z *= -1;
        }
        else if (this.position.z < -bounds.z / 2 + this.radius) {
            this.position.z = -bounds.z / 2 + this.radius;
            this.speed.z *= -1;
        }
    }
}
