// PByte3.js Library
// Supports protoByte development
// Generative softbody, virtual organisms
// Primary Language: Typescript
// Library Dependency: Three.js

// VerletMeshBase.ts
// Base Verlet Mesh class

// Ira Greenberg, David Gail Smith
// Bacon Bits Coopertive, 2021

// Thank you: Center of Creative Computation, SMU


import { BufferGeometry, Mesh } from "three";
import { VerletNode } from "./VerletNode";
import { VerletStick } from "./VerletStick";

export abstract class VerletGeometryBase extends Mesh {

    sticks: VerletStick[] = [];
    nodes: VerletNode[] = [];

    constructor() {
        super();
    }

    protected abstract _init(): void;
    abstract verlet(): void;

}