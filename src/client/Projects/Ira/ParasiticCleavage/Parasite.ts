// Parisitic Cleavage, 2022
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { BufferGeometry, CatmullRomCurve3, Color, Group, Line, LineBasicMaterial, Mesh, MeshPhongMaterial, RepeatWrapping, TextureLoader, Vector2, Vector3 } from "three";
import { randFloat } from "three/src/math/MathUtils";
import { cos, FuncType, particle, PI, sin, TWO_PI } from "../../../PByte3/IJGUtils";
import { ProtoTubeGeometry } from "../../../PByte3/ProtoTubeGeometry";

export class Parasite extends Group {

    // controls containment and expansion of parisite
    ovaShellRadMin = 0;
    ovaShellRadMax = 0;
    ovaShellRadAmp = 0;

    curve: CatmullRomCurve3;
    // lineGeom: BufferGeometry;
    curveMesh: Line;

    partCount: number;
    parts: particle[] = [];
    thetas: number[] = [];
    amps: number[] = [];
    frqs: number[] = [];

    pts: Vector3[] = [];

    protoTubeGeom: ProtoTubeGeometry;
    protoTubeMesh: Mesh
    tubeMin = 0;
    tubeMax = 0;
    tubePeriods = 0;
    tubeMinTheta = 0;
    tubeMaxTheta = 0;
    tubePeriodsTheta = 0;
    tubeMaxAmp = 0;

    tubeMinFreq = 0;
    tubeMaxFreq = 0;
    tubePeriodsFreq = 0;

    tubeRotationVals: Vector3;
    skin: string;

    constructor(partCount: number, tubeMinMax: Vector2, tubePeriods: number, ovaShellMinMax: Vector2, skin: string) {
        super();
        this.partCount = partCount;
        this.tubeMin = tubeMinMax.x;
        this.tubeMax = tubeMinMax.y;
        this.tubePeriods = tubePeriods;
        this.ovaShellRadMin = ovaShellMinMax.x;
        this.ovaShellRadMax = ovaShellMinMax.y;
        this.skin = skin;
        this.ovaShellRadAmp = randFloat(.3, 1.3);

        //let pts: Vector3[] = [];
        for (let i = 0; i < this.partCount; i++) {
            // let pos = new Vector3(randFloat(-8, 8), randFloat(-8, 8), randFloat(-8, 8));
            let pos = new Vector3(0, 0, 0);
            this.pts[i] = pos;
            let spd = new Vector3(randFloat(-4.8, 4.8), randFloat(-4.8, 4.8), randFloat(-4.8, 4.8));
            let g = Math.random() * 0xff;
            this.parts[i] = new particle(pos, spd, 1, new Color(g, g, g));
            this.add(this.parts[i]);

            this.thetas[i] = i * PI / 180;
            this.amps[i] = randFloat(1, 16);
            this.frqs[i] = randFloat(PI / 70, PI / 60);


        }
        this.curve = new CatmullRomCurve3(this.pts);
        const points = this.curve.getPoints(10);
        const geometry = new BufferGeometry().setFromPoints(points);

        const material = new LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: .4 });

        // Create the final object to add to the scene
        this.curveMesh = new Line(geometry, material);

        // this.add(this.curveMesh);

        const texture = new TextureLoader().load(this.skin);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(this.partCount / 2, 1);

        let c = Math.random() * 0x777777;
        let r = .7 + Math.random() * .3;
        let g = .7 + Math.random() * .3;
        let b = .7 + Math.random() * .3;
        let colTube = new Color(r, g, b);
        this.protoTubeGeom = new ProtoTubeGeometry(this.curve, 5001, 24, true, { func: FuncType.SINUSOIDAL, min: 1, max: 5, periods: 500 });
        let isWireFrame = (Math.round(Math.random() * 6) % 2 == 0) ? true : false;
        isWireFrame = false;
        let protoMat = new MeshPhongMaterial({
            color: colTube,
            specular: 0xDDDDDD + Math.random() * 0x333333,
            reflectivity: .8,
            shininess: randFloat(14, 25),
            wireframe: isWireFrame,
            /*side: DoubleSide,*/
            map: texture,
            transparent: true,
            opacity: .9,
            bumpMap: isWireFrame ? null : texture,
            bumpScale: randFloat(5, 19),

        });


        this.protoTubeMesh = new Mesh(this.protoTubeGeom, protoMat);
        this.add(this.protoTubeMesh);
        this.tubeRotationVals = new Vector3(randFloat(.007, .01), randFloat(-.007, -.01), randFloat(.007, .01));

        this.tubeMaxAmp = randFloat(70, 110);

        this.tubeMinFreq = randFloat(700, 2000);
        this.tubeMaxFreq = randFloat(700, 2000);
        this.tubePeriodsFreq = randFloat(100, 2000);
    }

    move(time: number) {

        let updatedPts = [];
        for (let i = 0; i < this.partCount; i++) {
            this.parts[i].pos.x = this.pts[i].x + sin(this.thetas[i]) * this.amps[i] + cos(this.thetas[i] * .25) * this.amps[i];
            this.parts[i].pos.y = this.pts[i].y + cos(this.thetas[i]) * this.amps[i] + sin(-this.thetas[i]) * this.amps[i]
            //this.parts[i].pos.z = this.pts[i].z - cos(this.thetas[i]) * this.amps[i];
            this.parts[i].move();
            if (this.parts[i].pos.length() >= this.ovaShellRadMin * 2) {
                this.parts[i].pos.normalize();
                this.parts[i].pos.multiplyScalar(this.ovaShellRadMin * 2);
                this.parts[i].spd.multiplyScalar(-1)
            }
            updatedPts[i] = this.parts[i].pos;
            this.thetas[i] += this.frqs[i];

        }


        this.curve = new CatmullRomCurve3(updatedPts);
        const points = this.curve.getPoints(this.partCount * 12);

        this.tubeMin = 3 + Math.abs(cos(this.tubeMinTheta) * 5);
        this.tubeMax = this.tubeMin + Math.abs(cos(this.tubeMaxTheta) * this.tubeMaxAmp);
        this.tubePeriods = 25 + Math.abs(cos(this.tubeMinTheta) * 0);
        // this.tubePeriods = 1;

        this.protoTubeGeom = new ProtoTubeGeometry(this.curve, points.length, 10, false, { func: FuncType.SINUSOIDAL, min: this.tubeMin, max: this.tubeMax, periods: this.tubePeriods });
        this.protoTubeMesh.geometry.dispose();
        this.protoTubeMesh.geometry = this.protoTubeGeom;

        // const lineGeom = new BufferGeometry().setFromPoints(updatedPts);
        // this.curveMesh.geometry = lineGeom;

        //? ++++++ TO DO:  customize these per parasite
        this.tubeMinTheta += PI / this.tubeMinFreq;
        this.tubeMaxTheta += PI / this.tubeMaxFreq;
        this.tubePeriodsTheta += PI / this.tubePeriodsFreq;

        //? ++++++ TO DO:  customize these per parasite
        this.protoTubeMesh.rotateX(this.tubeRotationVals.x)
        this.protoTubeMesh.rotateY(this.tubeRotationVals.y)
        this.protoTubeMesh.rotateZ(this.tubeRotationVals.z)

        //? ++++++ TO DO:  customize these per parasite
        if (this.ovaShellRadMin < this.ovaShellRadMax) {
            this.ovaShellRadMin += this.ovaShellRadAmp;
        }
    }

}