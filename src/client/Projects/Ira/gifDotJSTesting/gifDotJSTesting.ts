// gifDotJSTesting
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { BoxGeometry, Group, Mesh, MeshPhongMaterial, Vector3 } from "three";
import { FuncType } from "../../../PByte3/IJGUtils";

export class gifDotJSTesting extends Group {
    boxGeom: BoxGeometry | undefined;
    boxMat: MeshPhongMaterial | undefined;
    boxMesh: Mesh | undefined;

    constructor() {
        super();
        this.boxGeom = new BoxGeometry(300, 300, 300, 8, 8, 8)
        this.boxMat = new MeshPhongMaterial({ color: 0xff55dd, wireframe: true })

        this.create();
    }

    create() {
        this.boxMesh = new Mesh(this.boxGeom, this.boxMat);
        this.add(this.boxMesh);
    }

    move(time: number) {
        if (this.boxMesh) {
            this.boxMesh.rotation.x = time * .001;
            this.boxMesh.rotation.y = time * .001;
            this.boxMesh.rotation.z = time * .001;
        }
    }
}


