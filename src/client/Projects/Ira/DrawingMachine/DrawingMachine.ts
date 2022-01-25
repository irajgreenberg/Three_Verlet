// TendrilNetwork
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { Box3, CanvasTexture, Color, DoubleSide, Group, Mesh, MeshPhongMaterial, PlaneGeometry, RepeatWrapping, Vector3 } from "three";
import { FuncType, AnchorPoint, PI, sin, cos } from '../../../PByte3/IJGUtils';
import { VerletStrand } from '../../../PByte3/VerletStrand';
import { randFloat } from 'three/src/math/MathUtils';

let theta = 0;


export class DrawingMachine extends Group {
    ctx: any;
    groundGeom: PlaneGeometry | undefined;
    groundMesh: Mesh | undefined;

    texture: CanvasTexture | undefined;
    canvasGeom: PlaneGeometry | undefined;
    canvasMesh: Mesh | undefined;



    strand: VerletStrand | undefined;
    strandCount: number = 200;
    strands: VerletStrand[] = [];
    strandThetas: number[] = [];
    strandAmps: number[] = [];
    strandFreqs: number[] = [];
    strandCols: string[] = [];
    strandNibSizes: number[] = [];

    constructor() {
        super();
        this.create();
        // Get 2D canvas context. By default this type is null.

    }

    create() {
        this.groundGeom = new PlaneGeometry(1000, 1000);
        let groundMat = new MeshPhongMaterial({ color: 0xDDDDDD, side: DoubleSide });
        this.groundMesh = new Mesh(this.groundGeom, groundMat);
        this.add(this.groundMesh);
        this.groundMesh.rotation.x = PI / 2;

        var bbox = new Box3().setFromObject(this.groundMesh);
        console.log(bbox);


        // strands
        for (let i = 0; i < this.strandCount; i++) {

            this.strandThetas[i] = 0;
            this.strandAmps[i] = randFloat(-300, 300);
            this.strandFreqs[i] = randFloat(PI / 720, PI / 90);
            this.strandCols[i] = '#' + Math.floor(Math.random() * 16777215).toString(16);
            this.strandNibSizes[i] = randFloat(.8, 4);
            let x = randFloat(-300, 300)
            let z = randFloat(-300, 300)
            let head = new Vector3(x, 800, z);
            let tail = new Vector3(x, this.strandNibSizes[i], z);
            this.strands[i] = new VerletStrand(head, tail, 10, AnchorPoint.HEAD, randFloat(.1, .9));
            this.strands[i].setNodesScale(40)
            this.strands[i].setNodesColor(new Color(this.strandCols[i]));
            this.strands[i].setStrandColor(new Color(0xAAAAAA));
            //this.strands[i].castShadow = true;
            this.add(this.strands[i]);
            //this.strands[i].tail.y += 5
            for (let j = 0; j < this.strands[0].nodes.length; j++) {
                if (j == this.strands[0].nodes.length - 1) {
                    this.strands[i].nodes[j].geometry.scale(this.strandNibSizes[i], this.strandNibSizes[i], this.strandNibSizes[i])
                }
            }
        }

        this.ctx = document.createElement('canvas').getContext('2d');

        if (this.ctx) {
            document.body.appendChild(this.ctx.canvas);
            this.ctx.canvas.width = 1000;
            this.ctx.canvas.height = 1000;
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.texture = new CanvasTexture(this.ctx.canvas);
            // this.texture.wrapS = RepeatWrapping;
            // this.texture.wrapT = RepeatWrapping;
            // this.texture.repeat.x = 1;
            // this.texture.repeat.y = 1;

            this.canvasGeom = new PlaneGeometry(1000, 1000);
            let canvasMat = new MeshPhongMaterial({ color: 0xDDDDDD, side: DoubleSide, map: this.texture });
            this.canvasMesh = new Mesh(this.canvasGeom, canvasMat);
            this.canvasMesh.position.z -= 500;
            this.canvasMesh.position.y += 500;
            this.add(this.canvasMesh);

            this.ctx.beginPath()
            this.ctx.strokeStyle = '0xFF0000'
            this.ctx.lineWidth = 8
            this.ctx.moveTo(0, 0) // starting point

        }

    }

    move(time: number) {
        for (let i = 0; i < this.strandCount; i++) {
            this.strands[i].verlet();
            this.strands[i].setTailPosition(new Vector3(
                this.strands[i].tail.x + sin(this.strandThetas[i]) * this.strandAmps[i],
                this.strandNibSizes[i] * 2,
                this.strands[i].tail.z + + cos(this.strandThetas[i]) * this.strandAmps[i]));
            this.strandThetas[i] += this.strandFreqs[i]


            let x = this.strands[i].nodes[this.strands[i].nodes.length - 1].position.x;
            let y = this.strands[i].nodes[this.strands[i].nodes.length - 1].position.z;
            this.ctx.fillStyle = this.strandCols[i];
            this.ctx.fillRect(x + 500, y + 500, 3, 3);

        }

        this.texture!.needsUpdate = true;
    }
}


