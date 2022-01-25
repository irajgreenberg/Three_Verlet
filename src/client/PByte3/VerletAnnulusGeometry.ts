

import { BufferAttribute, BufferGeometry, Color, Float32BufferAttribute, PlaneGeometry, Vector3 } from "three";
import { AnchorPoint, PBMath } from "./IJGUtils";
import { VerletGeometryBase } from "./VerletGeometryBase";
import { VerletNode } from "./VerletNode";
import { VerletStick } from "./VerletStick";

export class VerletAnnulusGeometry extends VerletGeometryBase {
    attachmentEdge: Vector3[] = [];

    // for anchoring anulus to Protube
    headNodes: VerletNode[] = [];
    tailNodes: VerletNode[] = [];

    ringBands: number
    ringDiam: number;
    centroid: Vector3;

    // for buffered geometry
    vertices: BufferGeometry | undefined;


    constructor(attachmentEdge: Vector3[], ringDiam: number = 1, ringBands: number = 1) {
        super();
        this.attachmentEdge = attachmentEdge;
        this.ringDiam = ringDiam;
        this.ringBands = ringBands;

        this.centroid = PBMath.getCentroid(attachmentEdge);
        this._init();
    }

    // creates and returns annulus Mesh
    protected _init(): void {
        // calculcate thickness of each ring section
        let r = this.ringDiam / 2;
        let radiusVec = new Vector3(1, 1, 1);
        radiusVec.multiplyScalar(r);

        //console.log("this.attachmentEdge.length = ", this.attachmentEdge.length);   
        for (let i = 0, k = 0; i < this.attachmentEdge.length; i++) {
            // transform edge vector to origin
            this.attachmentEdge[i].sub(this.centroid);

            // magnitude difference between each inner edge vertex and outer radius
            let deltaMag = r - this.attachmentEdge[i].length();
            // magnitude of each band
            let bandMag = deltaMag / (this.ringBands - 1);
            // console.log("bandMag = ", bandMag);
            for (let j = 0; j < this.ringBands; j++) {
                k = i * this.ringBands + j;
                // start on each inner edge vertex
                let nodeVec = new Vector3();
                nodeVec.copy(this.attachmentEdge[i]);

                // position band nodes radially 
                nodeVec.normalize();
                nodeVec.multiplyScalar(r - bandMag * j);

                // transform all band nodes to back to relative ProtoTutbe position
                nodeVec.add(this.centroid);

                this.nodes.push(new VerletNode(nodeVec));
                this.nodes[k].setNodeColor(new Color(0xffffff));
                this.nodes[k].geometry.scale(2, 2, 2);
                this.nodes[k].setNodeVisible(true);
                this.nodes[k].setNodeAlpha(.6);

                this.add(this.nodes[k]);

                // for reference out of class to attach annulus
                if (j == 0) {
                    this.headNodes.push(this.nodes[k]);
                } else if (j == this.ringBands - 1) {
                    this.tailNodes.push(this.nodes[k]);
                }

                // create spine sticks across ringBands
                let terminal = 0;
                if (j > 0) {
                    if (j == 1) {
                        terminal = AnchorPoint.HEAD;
                    } else {
                        terminal = AnchorPoint.NONE;
                    }
                    let n = new VerletStick(this.nodes[k - 1], this.nodes[k]);
                    n!.setOpacity(.8);
                    n!.setColor(new Color(0xff9988));
                    this.sticks.push(n);
                    this.add(n);

                }
                k++;
            }
        }
        // create connecting sticks around/parallel to attachemnt edge
        let n: VerletStick | undefined;
        //let vecsTest = []
        for (let i = 0; i < this.ringBands; i++) {
            for (let j = 0; j < this.attachmentEdge.length; j++) {
                if (j < this.attachmentEdge.length - 1) {
                    n = new VerletStick(this.nodes[i + this.ringBands * j], this.nodes[i + this.ringBands * (j + 1)]);
                    // test planes
                    // if (i == 0) {
                    //     vecsTest.push(n.start.position);
                    //     vecsTest.push(n.end.position);
                    // }
                } else {
                    n = new VerletStick(this.nodes[i + this.ringBands * j], this.nodes[i]);
                }
                n!.setOpacity(.8);
                n!.start.scale.x = .5;
                n!.start.scale.y = .5;
                n!.start.scale.z = .5;
                n!.setColor(new Color(0xff9988));
                this.sticks.push(n!);
                this.add(n!);

            }
        }
        // create additional (invisible) cross-supports to maintain structure
        for (let i = 0; i < this.headNodes.length / 2; i++) {
            n = new VerletStick(this.headNodes[i], this.headNodes[this.headNodes.length / 2 + i]);
            n.setOpacity(0);
            this.sticks.push(n!);
            this.add(n!);
        }


        // buffered geometry
        let MAX_POINTS = this.attachmentEdge.length * this.ringBands;
        const positions = new Float32Array(MAX_POINTS * 3); // 3 vertices per point
        this.vertices = new BufferGeometry();
        this.vertices.setAttribute('position', new BufferAttribute(positions, 3));
        //this.vertices.setIndex();


    }

    // required
    verlet(): void {
        // this.nodes[0].position.x += .1;
        //this.headNodes[2].position.x += .1;
        for (let i = 0; i < this.nodes.length; i++) {

            if (i != 0) {
                this.nodes[i].verlet();
            }
        }
        for (let s of this.sticks) {
            s.constrainLen();
        }
    }
}