import { BoxGeometry, Vector3 } from "three";
import { VerletNode } from "./VerletNode";

export class VerletBlockGeometry extends BoxGeometry {
    // bounding box
    dim: Vector3;
    // verlet tension
    tension: number;

    nodes: VerletNode[] = []; // for convenience
    // sticks: VerletStick[] = [];


    constructor(dim: Vector3, segs: Vector3, tension: number) {
        super(dim.x, dim.y, dim.z, segs.x, segs.y, segs.z);
        this.dim = dim;
        this.tension = tension;


        let pos = this.attributes.position
        for (let i = 0; i < pos.count; i++) {
            const v = new Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
            this.nodes[i] = new VerletNode(v);
        }
    }


}