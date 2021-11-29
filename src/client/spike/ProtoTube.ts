import { CatmullRomCurve3, Color, Group, Mesh, MeshPhongMaterial, TubeGeometry } from "three";
import { ProtoTubeGeometry } from "../../PByte3/ProtoTubeGeometry";

export class ProtoTube extends Group {

    curve: CatmullRomCurve3;
    tubeRadius: number;
    tubeColor: Color;
    tubeSegs: number;
    radialSegs: number

    tubeGeom?: TubeGeometry;
    tubeMat?: MeshPhongMaterial;
    tubeMesh?: Mesh;

    constructor(curve: CatmullRomCurve3, tubeRadius: number, tubeColor: Color = new Color(0x888888), tubeSegs: number = 30, radialSegs: number = 12) {
        super();

        this.curve = curve;
        this.tubeRadius = tubeRadius;
        this.tubeColor = tubeColor;
        this.tubeSegs = tubeSegs;
        this.radialSegs = radialSegs;

        this.tubeGeom = new TubeGeometry(curve, tubeSegs, tubeRadius, radialSegs, false);
        this.tubeMat = new MeshPhongMaterial({ color: tubeColor, transparent: true, opacity: .3, wireframe: true });
        this.tubeMesh = new Mesh(this.tubeGeom, this.tubeMat);
        this.add(this.tubeMesh);

    }

    setTexture(): void {

    }

    setIsWireframe() {

    }
}