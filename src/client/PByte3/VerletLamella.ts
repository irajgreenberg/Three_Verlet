import { VerletNode } from './VerletNode';
import { VerletStick } from './VerletStick';
import { AnchorPoint, GeometryDetail, trace } from './IJGUtils';
import { BufferAttribute, BufferGeometry, Color, Group, Line, LineBasicMaterial, MathUtils, Mesh, MeshBasicMaterial, Vector2, Vector3 } from 'three';
import { VerletSegmentedStrip } from './VerletSegmentedStrip';


export class VerletLamella extends VerletSegmentedStrip {

    polySegments: Mesh[] = [];

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
            this.add(this.nodes[i]);

            if (i > 0) {
               if (i==1){
                this.segments[i - 1] = new VerletStick(this.nodes[i - 1], this.nodes[i], .5, 1);
               } else {
                this.segments[i - 1] = new VerletStick(this.nodes[i - 1], this.nodes[i], .5, 0);
               }
                this.add(this.segments[i - 1]);
            }
        }
        this.nodes[this.nodes.length-1].moveNode(new Vector3(.2, .1, .3));
    }

    // required
    live(): void {
        for (let n of this.nodes) {
            n.verlet();
        }
        for (let s of this.segments) {
            s.constrainLen();
        }

    }

    setOpacity(alpha:number):void {
        for(let i=0; i<this.segments.length; i++){
            this.segments[i].setOpacity(alpha);
        }
    }

}