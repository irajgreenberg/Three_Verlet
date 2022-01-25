// WingStudy
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { maxHeaderSize } from "http";
import { Box3, BufferGeometry, DoubleSide, Group, InterleavedBufferAttribute, Line, Mesh, MeshBasicMaterial, PlaneGeometry, Points, PointsMaterial, Vector3 } from "three";
import { FuncType, PI, sin } from "../../../PByte3/IJGUtils";

export class WingStudy extends Group {

    spineJoints: number = 12;
    spine: Points;
    spineInit: Points;
    spinePts: Vector3[] = [];
    spineHead: Vector3;
    spineTail: Vector3;

    wing: Mesh;
    positions: any;
    positionsInit: any;


    constructor() {
        super();

        let geom = new PlaneGeometry(75, 25, 10, 4);
        let mat = new MeshBasicMaterial({ color: 0xff9900, wireframe: false, side: DoubleSide });
        this.wing = new Mesh(geom, mat);
        // this.wing.rotateX(PI / 2);
        let wingAABB = new Box3().setFromObject(this.wing);

        this.add(this.wing);
        this.positions = this.wing.geometry.attributes.position;
        this.positionsInit = this.positions.clone();

        // create central spine down wing for deformation/flapping
        this.spineHead = new Vector3(wingAABB.max.x, (wingAABB.min.y + wingAABB.max.y) / 2, 0);
        this.spineTail = new Vector3(wingAABB.min.x, (wingAABB.min.y + wingAABB.max.y) / 2, 0);

        let delta = new Vector3(this.spineHead.x, this.spineHead.y, this.spineHead.z);
        delta.sub(this.spineTail);

        delta.divideScalar((this.spineJoints - 1));

        // this.spinePts: Vector3[] = [];
        let h = new Vector3(this.spineTail.x, this.spineTail.y, this.spineTail.z);

        for (let i = 0; i < this.spineJoints; i++) {
            this.spinePts[i] = new Vector3(h.x + delta.x * i, h.y + delta.y * i, h.z + delta.z * i);
        }
        // console.group(pts);
        let spineGeom = new BufferGeometry().setFromPoints(this.spinePts);
        this.spine = new Points(spineGeom, new PointsMaterial({ color: 0x00eeff, size: 3 }));
        this.spineInit = new Points(spineGeom, new PointsMaterial({ color: 0x00eeff, size: 3 }));
        // this.spineInit.copy(this.spine);
        this.add(this.spine);

    }


    move(time: number) {
        let pts = this.spine.geometry.attributes.position;

        let wingPts = this.wing.geometry.attributes.position;
        console.log(wingPts.count);
        let ptsInit = this.spineInit.geometry.attributes.position;
        pts.needsUpdate = true;
        let wingtip = pts.count - 1;
        let z = (sin((time * .2) * PI / 180.0) * 1);
        pts.setZ(wingtip, z);
        for (let i = 0; i < pts.count; i++) {
            pts.setZ(i, z * (2.0 / ((pts.getX(wingtip) - pts.getX(i)) * .003)) * 1);
        }

        for (let i = 0, k = 0; i < 11; i++) {
            for (let j = 0; j < 5; j++) {
                k = 11 * j + i
                wingPts.setZ(k, z * (2.0 / ((pts.getX(wingtip) - pts.getX(i)) * .003)) * 1);
            }
        }
        wingPts.needsUpdate = true;


    }
}


