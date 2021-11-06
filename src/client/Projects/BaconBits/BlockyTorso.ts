import { timeStamp } from "console";
import { Box3, BoxGeometry, BufferGeometry, Color, Group, Line, Line3, LineBasicMaterial, Mesh, MeshPhongMaterial, Vector3 } from "three";
import { PBMath } from "../../PByte3/IJGUtils";
import { VerletNode } from "../../PByte3/VerletNode";
import { VerletStick } from "../../PByte3/VerletStick";

export class BlockyTorso extends Group {

    pos: Vector3;
    dim: Vector3;
    parts: Vector3;
    nodes: VerletNode[] = [];
    nodesOrig: VerletNode[] = [];
    sticks: VerletStick[] = [];
    spine: VerletStick;
    blocks: Mesh[] = [];
    blockDims: Box3[] = [];
    spineTheta: number = 0;

    constructor(pos: Vector3, dim: Vector3, parts: Vector3) {
        super();
        this.pos = pos;
        this.dim = dim;
        this.parts = parts;

        // create spine
        // const spinePoints = [];
        // spinePoints.push(new Vector3(0, this.dim.y / 2, 0));
        // spinePoints.push(new Vector3(0, -this.dim.y / 2, 0));
        // const spineGeom = new BufferGeometry().setFromPoints(spinePoints);
        // const spineMat = new LineBasicMaterial({ color: 0xFFAA11 });

        // // ets
        this.spine = new VerletStick(new VerletNode(new Vector3(pos.x, pos.y + this.dim.y / 2 + .2, pos.z)), new VerletNode(new Vector3(pos.x, pos.y - this.dim.y / 2 - .2, pos.z)));

        // create nodes
        let blockW = dim.x / (parts.x - 1);
        let blockH = dim.y / (parts.y - 1);
        let blockD = dim.z / (parts.z - 1);
        for (let i = 0, nodeCtr = 0; i < parts.x; i++) {
            for (let j = 0; j < parts.y; j++) {
                for (let k = 0; k < parts.z; k++) {
                    // create nodes
                    this.nodes.push(new VerletNode(
                        new Vector3(pos.x - dim.x / 2 + blockW * i, pos.y - dim.y / 2 + blockH * j, pos.z - dim.z / 2 + blockD * k),
                        .02));
                    // capture original position of nodes
                    this.nodesOrig.push(new VerletNode(
                        new Vector3(pos.x - dim.x / 2 + blockW * i, pos.y - dim.y / 2 + blockH * j, pos.z - dim.z / 2 + blockD * k),
                        .02));
                    // create blocks
                    let geom: BoxGeometry = new BoxGeometry(blockW * PBMath.rand(.1, .5), blockH, blockD * PBMath.rand(.1, .5));
                    let mat: MeshPhongMaterial = new MeshPhongMaterial({ color: 0x44445A, transparent: true, opacity: .8 });
                    this.blocks.push(new Mesh(geom, mat));
                    this.blocks[this.blocks.length - 1].rotateX(PBMath.rand(-Math.PI / 15, Math.PI / 15));
                    this.blocks[this.blocks.length - 1].rotateY(PBMath.rand(-Math.PI / 15, Math.PI / 15));
                    this.blocks[this.blocks.length - 1].rotateZ(PBMath.rand(-Math.PI / 15, Math.PI / 15));
                    this.blocks[this.blocks.length - 1].castShadow = true;
                    this.add(this.blocks[this.blocks.length - 1]);

                    // capture block dimesnions for ground collision
                    this.blockDims.push(new Box3().setFromObject(this.blocks[this.blocks.length - 1]));

                }
            }
        }
        this.spine.setColor(new Color(0xFF3322));
        this.spine.setOpacity(.645);
        this.add(this.spine);

        //connect torso nodes to spine nodes
        for (let n of this.nodes) {
            this.sticks.push(new VerletStick(this.spine.start, n, PBMath.rand(.01, .08), 1));
            this.sticks.push(new VerletStick(this.spine.end, n, PBMath.rand(.01, .08), 1));
        }
        // connect torso nodes to each other
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = 0; j < this.nodes.length; j++) {
                if (i !== j && i % 5 == 0) {
                    this.sticks.push(new VerletStick(this.nodes[i], this.nodes[j], PBMath.rand(.03, .1), 0));
                }
            }
        }


        for (let n of this.nodes) {
            this.add(n);
        }

        for (let s of this.sticks) {
            this.add(s);
            s.setColor(new Color(0x88FF99));
            s.setOpacity(.25);
        }

        this.nodes[Math.round(this.nodes.length / 2)].moveNode(new Vector3(21, -20, 3));


    }

    live() {

        // perturb torso
        // if (Math.floor(Math.random() * 30) == 5) {
        //     this.nodes[Math.round(Math.random() * this.nodes.length - 1)].moveNode(new Vector3(PBMath.rand(-.3, .3), PBMath.rand(-.3, .3), PBMath.rand(-.3, .3)));
        // }
        this.nodes[5].position.x = this.nodesOrig[5].position.x + Math.cos(this.spineTheta) * .2;
        
        this.spine.start.verlet();
        this.spine.end.verlet();
        this.spine.position.y = Math.sin(this.spineTheta) * .5;
        this.spineTheta += Math.PI / 25;


        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].verlet();
            // bounce torso
            this.nodes[i].position.y = this.nodesOrig[i].position.y + this.spine.position.y;

            this.blocks[i].position.x = this.nodes[i].position.x;
            this.blocks[i].position.y = this.nodes[i].position.y;
            this.blocks[i].position.z = this.nodes[i].position.z;
        }

        this.spine.constrainLen();
        for (let s of this.sticks) {
            s.constrainLen();
            // s.lineGeometry
            // (s.lneGeometry as BufferGeometry).attributes.position.needsUpdate = true;
        }
    }

    groundCollide(groundY:number):void {
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].verlet();
            // bounce torso
            this.nodes[i].position.y = this.nodesOrig[i].position.y + this.spine.position.y;

            this.blocks[i].position.x = this.nodes[i].position.x;
            this.blocks[i].position.y = this.nodes[i].position.y;
            this.blocks[i].position.z = this.nodes[i].position.z;

            if(this.nodes[i].position.y < groundY + this.blockDims[i].min.y){
                this.nodes[i].position.y = groundY + this.blockDims[i].min.y;

            }
        }
    }
}