// Constellation, 2022
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { Color, DoubleSide, Group, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial, SphereGeometry, Vector2, Vector3 } from 'three';
import { PI, GeometryDetail } from '../../../PByte3/IJGUtils';
import { Constellation } from "./Constellation";
import { randFloat, randInt } from 'three/src/math/MathUtils';

export class Generator extends Group {
    // outer sphere
    orbGeom: SphereGeometry;
    orbMat: MeshPhongMaterial;
    orbColor: Color;
    orbMesh: Mesh;
    orbRadius = 500;
    orbSubDivision = 0;

    globalParticleSpeed = 0;

    constellationCount = randInt(6, 12);
    constellations: Constellation[] = [];

    constructor() {
        super();

        this.globalParticleSpeed = randFloat(1, 1);
        this.orbSubDivision = Math.round(randFloat(80, 110))
        this.orbGeom = new SphereGeometry(this.orbRadius, this.orbSubDivision, this.orbSubDivision);
        this.orbColor = new Color(Math.random() * 0xFFFFFF);
        this.orbMat = new MeshPhongMaterial({ color: this.orbColor, transparent: true, opacity: .07, wireframe: true });
        this.orbMesh = new Mesh(this.orbGeom, this.orbMat);
        this.add(this.orbMesh);
        this.orbMesh.rotateZ(-30 * PI / 180);

        for (let i = 0; i < this.constellationCount; i++) {
            let extremaPos = Math.random() * 4;
            this.constellations[i] = new Constellation(
                new Vector3(extremaPos, extremaPos, extremaPos),
                new Vector3(randFloat(.5, 3), randFloat(.5, 3), randFloat(.5, 3)).multiplyScalar(this.globalParticleSpeed),
                new Vector2(randFloat(3, 12), 500), randInt(70, 150), randInt(900, 1500), randFloat(.5, 1.5), GeometryDetail.CUBE,
                new MeshBasicMaterial({ color: Math.random() * 0xFFFFFF, wireframe: true, transparent: true, opacity: randFloat(.1, .3), side: DoubleSide }),
                new LineBasicMaterial({ color: Math.random() * 0xFFFFFF, transparent: true, opacity: randFloat(.1, .3) }));
            this.add(this.constellations[i]);
        }
    }

    move(time: number) {
        for (let i = 0; i < this.constellationCount; i++) {
            this.constellations[i].move(time, this.orbRadius);
        }
    }
}

