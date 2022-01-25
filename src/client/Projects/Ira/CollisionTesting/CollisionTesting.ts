// CollisionTesting
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { Group, Vector3, SphereGeometry, MeshPhongMaterial, Mesh } from 'three';
import { cos, FuncType, trace, Tri } from "../../../PByte3/IJGUtils";

export class CollisionTesting extends Group {

    sphereGeom: SphereGeometry | undefined;
    sphereMat: MeshPhongMaterial | undefined;
    sphereMesh: Mesh | undefined;
    sphereRad = 10;

    spd: Vector3 = new Vector3(.5 * .1, 3 * .1, -.2 * .1);

    tri: Tri | undefined;


    constructor() {
        super();
        this.create();
    }

    create() {
        this.tri = new Tri(new Vector3(-400, -100, -250), new Vector3(400, -100, -250), new Vector3(0, -100, 250), true);
        this.add(this.tri);

        this.sphereGeom = new SphereGeometry(this.sphereRad);
        this.sphereMat = new MeshPhongMaterial({ color: 0xFF9900 });
        this.sphereMesh = new Mesh(this.sphereGeom, this.sphereMat);
        this.add(this.sphereMesh);

        this.sphereMesh.position.y = 200;
    }

    move(time: number) {
        if (this.sphereMesh && this.tri) {
            this.sphereMesh.position.sub(this.spd);

            if (this.sphereMesh.position.y <= this.tri.getCentroid().y + this.sphereRad) {
                //this.spd.y *= -1;
            }


            let n = new Vector3();
            n.copy(this.tri.getNormal());
            let i = new Vector3();
            i.copy(this.sphereMesh.position);
            let c = new Vector3();
            c.copy(this.tri.getCentroid());
            i.sub(c);
            //i.multiplyScalar(-1);
            trace(i.length());
            n.normalize();
            i.normalize();
            let d = i.dot(n);
            //trace(Math.acos(d));


        }


    }
}


