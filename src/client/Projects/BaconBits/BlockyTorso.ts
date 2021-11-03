import { Line3, Vector3 } from "three";
import { VerletNode } from "../../PByte3/VerletNode";
import { VerletStick } from "../../PByte3/VerletStick";

export class BlockyTorso {

    dim: Vector3;
    parts: Vector3;
    nodes: VerletNode[] = [];
    sticks: VerletStick[] = [];
    spine: Line3;


    constructor(dim: Vector3, parts: Vector3) {
        this.dim = dim;
        this.parts = parts;
        this.spine = new Line3(new Vector3(0, this.dim.y / 2, 9), new Vector3(0, -this.dim.y / 2, 0));
        let blockW = dim.x / (parts.x + parts.x - 1);
        let blockH = dim.y / (parts.y + parts.y - 1);
        let blockD = dim.z / (parts.z + parts.z - 1);
        for (let i = 0; i < parts.x; i++) {
            for (let j = 0; j < parts.y; j++) {
                for (let k = 0; k < parts.z; k++) {
                    this.nodes.push();
                }
            }
        }
    }

    live() {

    }
}