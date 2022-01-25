import { timeStamp } from "console";
import { copyFileSync } from "fs";
import { Box3, BoxGeometry, BufferGeometry, Color, Group, Line, Line3, LineBasicMaterial, Mesh, MeshPhongMaterial, Vector3 } from "three";
import { PBMath } from "../../../PByte3/IJGUtils";
import { VerletNode } from "../../../PByte3/VerletNode";
import { VerletStick } from "../../../PByte3/VerletStick";

export class BlockyTorso extends Group {

    pos: Vector3;
    dim: Vector3;
    parts: Vector3;
    nodes: VerletNode[] = [];
    nodesOrig: VerletNode[] = [];
    sticks: VerletStick[] = [];
    spine: VerletStick;
    spineOrig: VerletStick;
    blocks: Mesh[] = [];
    blockDims: Box3[] = [];
    spineTheta: number = 0;

    spineGravity: number = .065;
    spineDamping: number = .999;
    spineSpdY: number = .002;



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
        this.spine = new VerletStick(new VerletNode(new Vector3(pos.x, pos.y + this.dim.y / 2 + .2, pos.z)), new VerletNode(new Vector3(pos.x, pos.y - this.dim.y / 2 - .2, pos.z)), 1, .1);

        this.spineOrig = new VerletStick(new VerletNode(new Vector3(pos.x, pos.y + this.dim.y / 2 + .2, pos.z)), new VerletNode(new Vector3(pos.x, pos.y - this.dim.y / 2 - .2, pos.z)), 1, .0003);

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
                        .09));
                    // capture original position of nodes
                    this.nodesOrig.push(new VerletNode(
                        new Vector3(pos.x - dim.x / 2 + blockW * i, pos.y - dim.y / 2 + blockH * j, pos.z - dim.z / 2 + blockD * k),
                        .02));
                    // create blocks
                    let geom: BoxGeometry = new BoxGeometry(blockW * PBMath.rand(.1, .5), blockH, blockD * PBMath.rand(.1, .5));
                    let mat: MeshPhongMaterial = new MeshPhongMaterial({ color: 0x44445A, transparent: true, opacity: .9 });
                    this.blocks.push(new Mesh(geom, mat));
                    this.blocks[this.blocks.length - 1].rotateX(PBMath.rand(-Math.PI / 15, Math.PI / 15));
                    this.blocks[this.blocks.length - 1].rotateY(PBMath.rand(-Math.PI / 15, Math.PI / 15));
                    this.blocks[this.blocks.length - 1].rotateZ(PBMath.rand(-Math.PI / 15, Math.PI / 15));
                    this.blocks[this.blocks.length - 1].castShadow = true;
                    this.add(this.blocks[this.blocks.length - 1]);

                    // capture block dimesnions for ground collision
                    this.blockDims.push(new Box3().setFromObject(this.blocks[this.blocks.length - 1]));
                    // console.log("blockDims[",i,"] = ", this.blockDims[this.blockDims.length-1]);
                    // console.log("block[",i,"] = ", this.blocks[this.blocks.length-1].geometry);
                    // console.log("block[",i,"] boundingBox = ", this.blocks[this.blocks.length-1].geometry.boundingBox!.min.y);
                }
            }
        }
        this.spine.setColor(new Color(0xFF3322));
        this.spine.setOpacity(1);
        // this.add(this.spine);

        //connect torso nodes to spine nodes
        for (let n of this.nodes) {
            this.sticks.push(new VerletStick(this.spine.start, n, PBMath.rand(.001, .08), 1));
            this.sticks.push(new VerletStick(this.spine.end, n, PBMath.rand(.001, .08), 1));
        }
        // connect torso nodes to each other
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = 0; j < this.nodes.length; j++) {
                if (i !== j && i % 12 == 0) {
                    this.sticks.push(new VerletStick(this.nodes[i], this.nodes[j], PBMath.rand(.03, .06), 0));
                }
            }
        }


        for (let n of this.nodes) {
            //  this.add(n);
        }

        for (let s of this.sticks) {
            this.add(s);
            s.setColor(new Color(0x88FF99));
            s.setOpacity(.145);
        }

        this.nodes[Math.round(this.nodes.length / 2)].moveNode(new Vector3(21, -20, 3));

        // for (let i = 0; i < this.nodes.length; i++) {
        //     this.nodes[i].position.y -=2;
        // }
        // this.spine.start.position.y-=.02;
        // this.spine.end.position.y-=.02;

    }

    live() {

        // perturb torso
        // if (Math.floor(Math.random() * 30) == 5) {
        //     this.nodes[Math.round(Math.random() * this.nodes.length - 1)].moveNode(new Vector3(PBMath.rand(-.3, .3), PBMath.rand(-.3, .3), PBMath.rand(-.3, .3)));
        // }
        // this.nodes[5].position.x = this.nodesOrig[5].position.x + Math.cos(this.spineTheta) * .2;

        this.spine.start.verlet();
        this.spine.end.verlet();
        //this.spine.position.y = Math.sin(this.spineTheta) * .5;
        this.spineTheta += Math.PI / 5;


        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].verlet();
            // bounce torso
            // this.nodes[i].position.y = this.nodesOrig[i].position.y + this.spine.position.y;

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

    groundCollide(groundY: number): void {

        //this.spineSpdY += this.spineGravity;
        this.spineSpdY += Math.PI / 18;
        this.spine.start.position.y -= this.spineSpdY;
        this.spine.start.position.y = this.spineOrig.start.position.y + Math.cos(this.spineSpdY) * .55



        this.spineTheta
        // spine collision
        //console.log("this.spine.start.position.y = ", this.spine.start.position.y);
        if (this.spine.start.position.y <= groundY) {
            this.spine.start.position.y = groundY;
            this.spineSpdY *= -1;
            this.spineSpdY *= this.spineDamping;
        } else if (this.spine.end.position.y <= groundY) {
            // this.spine.end.position.y += .2;
        }

        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].verlet();
            // bounce torso
            //this.nodes[i].position.y = this.nodesOrig[i].position.y + this.spine.position.y;

            this.blocks[i].position.x = this.nodes[i].position.x;
            this.blocks[i].position.y = this.nodes[i].position.y;
            this.blocks[i].position.z = this.nodes[i].position.z;
            //let blockHt = this.blocks[i].geometry.boundingBox;

            // console.log("this.nodes[i].position.y = ", this.nodes[0].position.y);
            // console.log("groundY = ", groundY);

            if (this.nodes[i].position.y < groundY + this.blockDims[i].min.y) {
                // this.nodes[i].position.y = groundY + this.blockDims[i].min.y;
                //this.nodes[i].position.y = 100;

            }

        }
    }
}