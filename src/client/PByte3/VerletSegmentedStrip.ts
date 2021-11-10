// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall

// Base class for segmented Strip Verlet Geometry

import { Group, Vector3 } from 'three';
import { VerletNode } from './VerletNode';
import { VerletStick } from './VerletStick';

export abstract class VerletSegmentedStrip extends Group {
    head: Vector3;
    tail: Vector3;
    segmentCount: number;
    segments: VerletStick[] = [];
    nodes: VerletNode[] = [];

    constructor(head: Vector3, tail: Vector3, segmentCount: number){
        super();
        this.head = head;
        this.tail = tail;
        this.segmentCount = segmentCount;
    }

    abstract live():void;
}