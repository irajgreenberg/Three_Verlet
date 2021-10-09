
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

import { PolyhedronGeometry, Vector3 } from "three";
import { Quad } from "../../PByte3/IJGUtils";
import { VerletNode } from "../../PByte3/VerletNode";
import { VerletStick } from "../../PByte3/VerletStick";


export class HairyBlob extends PolyhedronGeometry {
    elasticity: number;
    //nodes: VerletNode[];
    //sticks: VerletStick[];

    //internals
    //  private rects: Quad[] = [];

    constructor(radius: number, detail: number, elasticity: number) {

        const t = (1 + Math.sqrt(5)) / 2;

        const vertices = [
            - 1, t, 0, 1, t, 0, - 1, - t, 0, 1, - t, 0,
            0, - 1, t, 0, 1, t, 0, - 1, - t, 0, 1, - t,
            t, 0, - 1, t, 0, 1, - t, 0, - 1, - t, 0, 1
        ];

        const indices = [
            0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
            1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
            3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
            4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1
        ];

        super(vertices, indices, radius, detail);
        this.elasticity = elasticity;

        for (let i = 0; i < indices.length; i++) {
            //)
        }

    }
}