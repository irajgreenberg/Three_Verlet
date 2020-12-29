import { VerletNode } from './PByte3/VerletNode';
import * as THREE from '/build/three.module.js';
import { Vector3 } from '/build/three.module.js';
class VerletTetrahedron extends THREE.Group {
    // geom: THREE.Geometry;
    // mat: THREE.Material;
    constructor(pos, radius, tension) {
        super();
        this.radius = 0;
        this.nodes = new Array(5);
        this.pos = pos;
        this.radius = radius;
        this.tension = tension;
        this.position.set(pos.x, pos.y, pos.z);
        //top node
        this.nodes.push(new VerletNode(new Vector3(), radius));
        // traingle ring
        let theta = 0;
        for (var i = 0; i < 3; i++) {
            this.nodes.push(new VerletNode(new Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0), radius));
            theta += Math.PI * 2 / 3;
        }
        // bottom node
        this.nodes.push(new VerletNode(new Vector3(), -radius));
    }
}
