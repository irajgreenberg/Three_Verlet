import { VerletNode } from './VerletNode';
import { VerletStick } from './VerletStick';
import { AnchorPoint, FrenetFrame, GeometryDetail, Quad, trace } from './IJGUtils';
import { BufferAttribute, BufferGeometry, Color, DoubleSide, Group, Line, LineBasicMaterial, MathUtils, Mesh, MeshBasicMaterial, MeshPhongMaterial, PlaneGeometry, Shape, Vector2, Vector3 } from 'three';
import { VerletSegmentedStrip } from './VerletSegmentedStrip';
import { line } from './IJGUtils';

let sectW = 1.5;
export class VerletLamella extends VerletSegmentedStrip {

    lamelliSections: Mesh[] = [];
    lamelliPlanes: PlaneGeometry[] = [];
    frames: FrenetFrame[] = [];
    sections: Quad[] = [];
    shapes: Shape[] = [];



    constructor(head: Vector3, tail: Vector3, segmentCount: number, widthsRange: Vector2) {
        super(head, tail, segmentCount);
        // Note: nodes count = segmentCount+1
        let terminalDelta = new Vector3();
        terminalDelta.copy(tail);
        terminalDelta.sub(head);
        terminalDelta.divideScalar(segmentCount);


        let stepNode = new Vector3();
        stepNode.copy(head);
        for (let i = 0; i <= segmentCount; i++) {
            stepNode.x = terminalDelta.x * i;
            stepNode.y = terminalDelta.y * i;
            stepNode.z = terminalDelta.z * i;
            this.nodes[i] = new VerletNode(stepNode, .03, new Color(0xFF6677));
            this.nodes[i].castShadow = true;
            this.add(this.nodes[i]);

            // verlet sticks
            if (i > 0) {
                if (i == 1) {
                    this.segments[i - 1] = new VerletStick(this.nodes[i - 1], this.nodes[i], .5, 1);
                } else {
                    this.segments[i - 1] = new VerletStick(this.nodes[i - 1], this.nodes[i], .5, 0);
                }
                this.add(this.segments[i - 1]);
            }

            // Lamelli Sections
            if (i > 0) {
                //     const vector = new Vector3();
                //     vector.subVectors(this.nodes[i].position, this.nodes[i-1].position);
                //    trace("vector = ", vector);
                // const sectionGeom = new ShapeGeometry( heartShape )
                // const sectionMat = new MeshPhongMaterial( { color: 0xddcccc } );
                // let slope

            }

        }
        this.nodes[this.nodes.length - 1].moveNode(new Vector3(.2, .1, .3));


        // create Frenet frames
        for (let i = 0; i < this.nodes.length; i++) {
            if (i > 0 && i < this.nodes.length - 1) {
                this.frames[i - 1] = new FrenetFrame(this.nodes[i - 1].position, this.nodes[i].position, this.nodes[i + 1].position, .3);
                this.add(this.frames[i - 1]);
            }
        }

        // sections
        for (let i = 0; i < this.frames.length - 1; i++) {
            const pts: Vector3[] = [];
            let v0 = this.frames[i].getNormal().multiplyScalar(sectW);
            let v1 = this.frames[i].getNormal().multiplyScalar(-sectW);
            let v2 = this.frames[i + 1].getNormal().multiplyScalar(sectW);
            let v3 = this.frames[i + 1].getNormal().multiplyScalar(-sectW);
            pts.push(v0);
            pts.push(v1);
            pts.push(v2);
            pts.push(v3);
            let geom = new BufferGeometry().setFromPoints(pts);
            //console.log(geom);
            let mat = new MeshPhongMaterial({ color: 0x661188 });
            let planeMat = new MeshPhongMaterial({ color: 0x661188, opacity: 0.5, side: DoubleSide });
            let planeGeom = new PlaneGeometry(1, 1);
            this.lamelliSections[i] = new Mesh(planeGeom, planeMat);
            if (i == 0) {
                //  trace(this.lamelliSections[i].geometry.attributes.position);
            }
            //this.lamelliSections[i] = new Mesh(geom, mat);
            this.add(this.lamelliSections[i]);
        }
    }

    // required
    live(): void {
        for (let n of this.nodes) {
            n.verlet();
        }
        for (let s of this.segments) {
            s.constrainLen();
        }

        // update Lamelli Sections
        for (let i = 0; i < this.nodes.length; i++) {
            if (i > 0 && i < this.nodes.length - 1) {
                this.frames[i - 1].update(this.nodes[i - 1].position, this.nodes[i].position, this.nodes[i + 1].position);

                // let v0 = this.frames[i - 1].getNormal().multiplyScalar(sectW);
                // let v1 = this.frames[i - 1].getNormal().multiplyScalar(-sectW);
                // let v2 = this.frames[i].getNormal().multiplyScalar(sectW);
                // let v3 = this.frames[i].getNormal().multiplyScalar(-sectW);


                
                if (i > 1) {
                    // let v0 = this.frames[i - 1].getNormal().multiplyScalar(sectW);
                    // let v1 = this.frames[i - 1].getNormal().multiplyScalar(-sectW);
                    // let v2 = this.frames[i].getNormal().multiplyScalar(sectW);
                    // let v3 = this.frames[i].getNormal().multiplyScalar(-sectW);

                    // this.lamelliSections[i].geometry.attributes.position.setXYZ(0, this.nodes[i].position.x + v0.x, this.nodes[i].position.y + v0.y, this.nodes[i].position.z + v0.z);
                    // this.lamelliSections[i].geometry.attributes.position.setXYZ(1, this.nodes[i].position.x + v1.x, this.nodes[i].position.y + v1.y, this.nodes[i].position.z + v1.z);
                    // this.lamelliSections[i].geometry.attributes.position.setXYZ(2, this.nodes[i].position.x + v2.x, this.nodes[i].position.y + v2.y, this.nodes[i].position.z + v2.z);
                    // this.lamelliSections[i].geometry.attributes.position.setXYZ(3, this.nodes[i].position.x + v3.x, this.nodes[i].position.y + v3.y, this.nodes[i].position.z + v3.z);
                }
            }
        }

        for (let i = 0; i < this.frames.length - 1; i++) {
            (this.lamelliSections[i].geometry as BufferGeometry).attributes.position.needsUpdate = true;

            let v0 = this.frames[i].getNormal().multiplyScalar(sectW);
            let v1 = this.frames[i].getNormal().multiplyScalar(-sectW);
            let v2 = this.frames[i + 1].getNormal().multiplyScalar(sectW);
            let v3 = this.frames[i + 1].getNormal().multiplyScalar(-sectW);
            if (i == 1) {
                //   console.log ("v0 = ", v0);
                //   console.log ("v1 = ", v1);
                //   console.log ("v2 = ", v2);
                //   console.log ("v3 = ", v3);
            }
            let x = this.frames[i].nodePos.x;
            let y = this.frames[i].nodePos.y;
            let z = this.frames[i].nodePos.z;

            if (i == 5) {
                //   console.log ("x = ", x);
                //   console.log ("y = ", y);
                //   console.log ("z = ", z);
            }


            this.lamelliSections[i].geometry.attributes.position.setXYZ(0, x + v0.x, y + v0.y, z + v0.z);
            this.lamelliSections[i].geometry.attributes.position.setXYZ(1, x + v1.x, y + v1.y, z + v1.z);
            this.lamelliSections[i].geometry.attributes.position.setXYZ(2, x + v2.x, y + v2.y, z + v2.z);
            this.lamelliSections[i].geometry.attributes.position.setXYZ(3, x + v3.x, y + v3.y, z + v3.z);



            // this.lamelliSections[i].geometry.attributes.position.setXYZ(0, -2, 4, 0);
            // this.lamelliSections[i].geometry.attributes.position.setXYZ(1, 2, 4, 0);
            // this.lamelliSections[i].geometry.attributes.position.setXYZ(2, -2, -4, 0);
            // this.lamelliSections[i].geometry.attributes.position.setXYZ(3, 2, -4, 0);
        }

    }

    setOpacity(alpha: number): void {
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].setOpacity(alpha);
        }
    }

}