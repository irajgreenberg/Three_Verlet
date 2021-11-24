import * as THREE from "three";
import { Curve, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, TubeBufferGeometry, TubeGeometry, Vector3 } from "three";
import { PBMath } from "../../PByte3/IJGUtils";
import { ProtoTubeGeometry } from "../../PByte3/ProtoTubeGeometry";

export class Protobyte extends Group {

    constructor() {
        super();
        class CustomSinCurve extends Curve<Vector3> {
            scale: number;
            constructor(scale: number = 1) {

                super();

                this.scale = scale;

            }

            getPoint(t: number, optionalTarget = new Vector3()) {

                const tx = t * 3 - 1.5;
                const ty = Math.sin(2 * Math.PI * t);
                const tz = 0;

                return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);

            }

        }

        const tubeSegs = 120;
        const path = new CustomSinCurve(100);
        //let curveSegs = 10;
        let radii: number[] = [];
        for (let i = 0; i < tubeSegs; i++) {
            radii[i] = PBMath.rand(3.2, 8.8);
        }

        const texture = new THREE.TextureLoader().load("textures/corroded_red.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 1);


        const geometry = new ProtoTubeGeometry(path, tubeSegs, radii, 12, false);
        const material = new MeshPhongMaterial({ color: 0xffffff, wireframe: false, side: DoubleSide, map: texture, transparent: true, opacity: 1, bumpMap: texture, bumpScale: 3, shininess: 60 });
        const mesh = new Mesh(geometry, material);
        this.add(mesh);

        const material2 = new MeshBasicMaterial({ color: 0xFFCCCC, wireframe: true, side: DoubleSide, transparent: true, opacity: .4 });
        const mesh2 = new Mesh(geometry, material2);
        //mesh2.scale.multiplyScalar(1.0001)
        //this.add(mesh2);

    }
}