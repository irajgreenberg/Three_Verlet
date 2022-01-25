// SingleCurve
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { BufferGeometry, CatmullRomCurve3, Group, Line, LineBasicMaterial, Mesh, MeshPhongMaterial, RepeatWrapping, TextureLoader, Vector3 } from "three";
import { randFloat } from "three/src/math/MathUtils";
import { cos, FuncType, PI, sin } from "../../../PByte3/IJGUtils";
import { ProtoTubeGeometry } from "../../../PByte3/ProtoTubeGeometry";
let theta = 0;
let phi = 0;
let theta2 = 0;
let amp1 = 300;

export class SingleCurve extends Group {

    ptCount = 10000;
    pts: Vector3[] = [];
    //curve: CatmullRomCurve3;

    constructor() {
        super();
        this.create();
    }

    create() {
        for (let i = 0; i < this.ptCount; i++) {
            let x = sin(theta) * i * .01 + cos(i * i * PI / randFloat(120, 180)) * randFloat(-amp1, amp1);
            let y = sin(phi - i * PI / 180) * i * .01 - sin(i * i * PI / randFloat(120, 180)) * randFloat(-amp1, amp1);
            let z = cos(theta) * i * .01 + sin(i * i * PI / randFloat(120, 180)) * randFloat(-amp1, amp1);
            this.pts[i] = new Vector3(x, y, z);
            theta += PI / 20;
            phi += PI / 40;
        }


        // this.curve = new CatmullRomCurve3(this.pts);
        // const points = curve.getPoints(50);
        const geometry = new BufferGeometry().setFromPoints(this.pts);
        const material = new LineBasicMaterial({ color: 0xff0000 });
        // Create the final object to add to the scene
        const curveObject = new Line(geometry, material);
        // this.add(curveObject);

        const texture = new TextureLoader().load("textures/aluminum_foil.jpg");
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(30000, 1);

        let curve = new CatmullRomCurve3(this.pts);
        let tubeGeom = new ProtoTubeGeometry(curve, 140000, 24, false, { func: FuncType.SINUSOIDAL, min: 1, max: 6, periods: 80000 }, 5);
        const tubeMat = new MeshPhongMaterial({
            color: 0xffaaff,
            wireframe: false,
            map: texture,
            transparent: true,
            opacity: 1,
        /* bumpMap: texture, */ bumpScale: 1,
            shininess: 0.1,
        });
        let tubeMesh = new Mesh(tubeGeom, tubeMat);
        this.add(tubeMesh);
    }

    move(time: number) {
    }
}


