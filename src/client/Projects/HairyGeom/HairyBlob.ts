
// PByte Library
// Supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons, Brent Brimhall & David Smith
// @baconBitsCollective

// iocsoedron -> tessleated Sphere
// Original Author: Ira Greenberg, 10/2021
// Center of Creative Computation, SMU

// Thanks to: https://superhedral.com/2020/05/17/building-the-unit-icosahedron/
//----------------------------------------------

import { BufferGeometry, Color, Group, Vector, Vector3 } from "three";
import { AnchorPoint, GeometryDetail, Tri } from "../../PByte3/IJGUtils";
import { VerletNode } from "../../PByte3/VerletNode";
import { VerletStick } from "../../PByte3/VerletStick";


export class HairyBlob extends Group {
    elasticity: number;
    nodes: VerletNode[]
    sticks: VerletStick[];
    tris: Tri[];
    centerNode: VerletNode;


    geometry: BufferGeometry;
    // buffer attributes
    // const positions = [];
    // const normals = [];
    // const uvs = [];



    constructor(radius: number, detail: number, elasticity: number) {
        super();
        const t = (1 + Math.sqrt(5)) / 2;

        const vertices = [
            - 1, t, 0,
            1, t, 0,
            - 1, - t, 0,
            1, - t, 0,
            0, - 1, t,
            0, 1, t,
            0, - 1, - t,
            0, 1, - t,
            t, 0, - 1,
            t, 0, 1,
            - t, 0, - 1,
            - t, 0, 1
        ];

        // face3 vertices
        const indices = [
            0, 11, 5,
            0, 5, 1,
            0, 1, 7,
            0, 7, 10,
            0, 10, 11,
            1, 5, 9,
            5, 11, 4,
            11, 10, 2,
            10, 7, 6,
            7, 1, 8,
            3, 9, 4,
            3, 4, 2,
            3, 2, 6,
            3, 6, 8,
            3, 8, 9,
            4, 9, 5,
            2, 4, 11,
            6, 2, 10,
            8, 6, 7,
            9, 8, 1
        ];

        // create BufferGeometry
        this.geometry = new BufferGeometry();

        const positions = [];
        const normals = [];
        const uvs = [];
        for (let i = 0; i < indices.length; i++) {
            // positions.push(vertices[indices[i * 3]]);

            // normals.push(...vertex.norm);
            // uvs.push(...vertex.uv);
        }


        const vecs: Vector3[] = [];
        for (let i = 0, j = 0; i < vertices.length; i += 3) {
            vecs[j++] = new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
        }

        for (let i = 0; i < indices.length; i += 3) {
            positions.push(vecs[indices[i]].x);
            positions.push(vecs[indices[i]].y);
            positions.push(vecs[indices[i]].z);
        }



        this.elasticity = elasticity;
        this.tris = [];
        this.nodes = [];
        this.sticks = [];

        for (let i = 0, j = 0; i < indices.length; i += 3) {
            this.tris[j++] = new Tri(vecs[indices[i]], vecs[indices[i + 1]], vecs[indices[i + 2]]);
        }

        // calulate unique Verlet nodes
        for (let i = 0; i < vecs.length; i++) {
            this.nodes[i] = new VerletNode(vecs[i].multiplyScalar(radius), .01,
                new Color(1, 1, 1), GeometryDetail.SPHERE_LOW);
            this.add(this.nodes[i]);
        }

        // get center node for cross-supports
        this.centerNode = new VerletNode(this.getCentroid(), .01, new Color(1, 1, 1), GeometryDetail.SPHERE_LOW);

        // calculate unique Verlet sticks
        for (let i = 0, k = 0; i < indices.length; i += 3) {
            let isAddable = true;
            let isAddable2 = true;
            let isAddable3 = true;
            for (let j = 0; j < this.sticks.length; j++) {
                if (this.nodes[indices[i]] === this.sticks[j].start &&
                    this.nodes[indices[i + 1]] === this.sticks[j].end ||
                    this.nodes[indices[i]] === this.sticks[j].end &&
                    this.nodes[indices[i + 1]] === this.sticks[j].start) {
                    isAddable = false;
                }

                if (this.nodes[indices[i + 1]] === this.sticks[j].start &&
                    this.nodes[indices[i + 2]] === this.sticks[j].end ||
                    this.nodes[indices[i + 1]] === this.sticks[j].end &&
                    this.nodes[indices[i + 2]] === this.sticks[j].start) {
                    isAddable2 = false;
                }

                if (this.nodes[indices[i + 2]] === this.sticks[j].start &&
                    this.nodes[indices[i]] === this.sticks[j].end ||
                    this.nodes[indices[i + 2]] === this.sticks[j].end &&
                    this.nodes[indices[i]] === this.sticks[j].start) {
                    isAddable3 = false;
                }
            }
            if (isAddable) {
                this.sticks[k++] = new VerletStick(this.nodes[indices[i]], this.nodes[indices[i + 1]], .01);
            }

            if (isAddable2) {
                this.sticks[k++] = new VerletStick(this.nodes[indices[i + 1]], this.nodes[indices[i + 2]], .01);
            }

            if (isAddable3) {
                this.sticks[k++] = new VerletStick(this.nodes[indices[i + 2]], this.nodes[indices[i]], .01);
            }

        }

        // add cross supports
        for (const n of this.nodes) {
            this.sticks.push(new VerletStick(this.centerNode, n, .5));
        }

        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = 0; j < this.nodes.length; j++) {
                if (this.nodes[i] != this.nodes[j]) {
                    this.sticks.push(new VerletStick(this.nodes[i], this.nodes[j], .005));
                }
            }
        }


        // console.log("sticks length = ", this.sticks.length)
        for (let i = 0; i < this.sticks.length; i++) {
            if (i < 30) {
                this.add(this.sticks[i]);
            }
        }


    }

    getCentroid(): Vector3 {
        let c = new Vector3();
        for (const n of this.nodes) {
            c.add(n.position);
        }
        return c.divideScalar(this.nodes.length);
    }

    moveCenter(vec: Vector3) {
        // ensure in range
        this.centerNode.moveNode(vec);
    }


    move(index: number, vec: Vector3) {
        // ensure in range
        this.nodes[index].moveNode(vec);
    }

    live() {


        for (const n of this.nodes) {
            n.verlet();
        }
        this.centerNode.verlet();

        for (const s of this.sticks) {
            s.constrainLen();
        }

    }

    constrainBounds(bounds: Vector3): void {
        for (const n of this.nodes) {
            n.constrainBounds(bounds);
        }
    }

    test = () => console.log("this is a test");

    test2() {
        console.log("this is a test")
    }

}