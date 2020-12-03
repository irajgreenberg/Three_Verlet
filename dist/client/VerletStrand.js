// draw tendrils
import * as THREE from '/build/three.module.js';
import { VerletNode } from './VerletNode.js';
import { VerletStick } from './VerletStick.js';
//const tendrilCount: number = 20;
export class VerletStrand extends THREE.Group {
    constructor(segmentCount) {
        super();
        // anchor stick detail
        //private anchorDetail:number;
        this.geometry = new THREE.Geometry();
        this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.segmentCount = segmentCount;
        this.segments = new Array(segmentCount);
        this.nodes = new Array(segmentCount + 1);
        this.tendril = new THREE.Line();
        for (var i = 0; i < this.nodes.length; i++) {
            // nodes[i] = new VerletNode(new THREE.Vector3(THREE.MathUtils.randFloatSpread(.09),
            //     THREE.MathUtils.randFloatSpread(.09), THREE.MathUtils.randFloatSpread(.09)), THREE.MathUtils.randFloat(.002, .005));
            this.nodes[i] = new VerletNode(new THREE.Vector3(.2, i * .02, THREE.MathUtils.randFloatSpread(.01)), THREE.MathUtils.randFloat(.002, .005));
            this.add(this.nodes[i]);
            if (i > 0) {
                this.nodes[i].moveNode(new THREE.Vector3(THREE.MathUtils.randFloatSpread(.001), THREE.MathUtils.randFloatSpread(.001), THREE.MathUtils.randFloatSpread(.001)));
            }
        }
        for (var i = 0; i < this.segments.length; i++) {
            // add constraints
            if (i == 0) {
                this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.2, .4), 1);
            }
            else {
                this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.2, .4), 0);
            }
            this.geometry.vertices.push(this.segments[i].start.position);
            if (i === this.segments.length - 1) {
                this.geometry.vertices.push(this.segments[i].end.position);
            }
            //geometry.vertices.push(vSticks[i].end.position);
        }
        this.tendril = new THREE.Line(this.geometry, this.material);
        this.add(this.tendril);
    }
}
