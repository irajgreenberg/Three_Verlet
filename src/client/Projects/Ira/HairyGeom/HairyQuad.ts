import { BufferGeometry, Color, Group, Line, LineBasicMaterial, Vector3 } from "three";
import { HairDensity } from "../../../PByte3/IJGUtils";
import { VerletStrand } from "../../../PByte3/VerletStrand";
import { HairyLine } from "./HairyLine";

// defaults to XY-plane
export class HairyQuad extends Group {

    pos: Vector3;
    dim: Vector3;
    tendrils: HairyLine[] = [];

    constructor(pos: Vector3, dim: Vector3, hairLength: number, hairsegs: number, hairDensity: HairDensity) {
        super();
        this.pos = pos;
        this.dim = dim;




    }
}