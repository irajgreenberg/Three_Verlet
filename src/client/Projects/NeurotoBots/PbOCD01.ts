import { DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import { ProtoBase } from "./ProtoBase";

class PbOCD01 extends ProtoBase {
    setup() {
        const geometry = new PlaneGeometry(1, 1);
        const material = new MeshBasicMaterial({ color: 0xffff00, side: DoubleSide });
        const plane = new Mesh(geometry, material);
        console.log("In setup");
        this.add(plane);
    }

    // animation code
    run() {

    }
}