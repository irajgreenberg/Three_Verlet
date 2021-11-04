import { BoxGeometry, Group, LineCurve, Mesh, MeshPhongMaterial, Vector3 } from 'three';
import { VerletNode } from '../../PByte3/VerletNode';
import { PBMath } from '../../PByte3/IJGUtils';
import { VerletStick } from '../../PByte3/VerletStick';

export class BlockyHead extends Group {
    // Custom Geometry
    // 200 random cubbies
    NODE_COUNT = 1000;
    nodes: VerletNode[] = [];
    hubNeck: VerletNode = new VerletNode(new Vector3(0, -1.5, 0));
    hubHead: VerletNode = new VerletNode(new Vector3(0));
    hubHeadStrap: VerletNode = new VerletNode(new Vector3(0, 1.5, 0));
    hubHeadStrapRight: VerletNode = new VerletNode(new Vector3(1.5, 0, 0));
    hubHeadStrapLeft: VerletNode = new VerletNode(new Vector3(-1.5, 0, 0));
    hubHeadStrapFront: VerletNode = new VerletNode(new Vector3(0, 0, -1.5));
    hubHeadStrapBack: VerletNode = new VerletNode(new Vector3(0, 0, 1.5));
    sticks: VerletStick[] = [];
    blocks: Mesh[] = [];

    gravity = 0;

    constructor() {
        super();
        for (let i = 0; i < this.NODE_COUNT; i++) {
            let theta = Math.random() * Math.PI * 2;
            let radius = PBMath.rand(.2, .9);
            // random z rot
            let x = Math.cos(theta) * radius;
            let y = Math.sin(theta) * radius;
            let z = 0;
            // random y rot
            let phi = Math.random() * Math.PI * 2;
            let z2 = z * Math.cos(phi) - x * Math.sin(phi)
            let x2 = z * Math.sin(phi) + x * Math.cos(phi)
            let y2 = y;
            this.nodes[i] = new VerletNode(new Vector3(x2, y2, z2), .02);
            // scene.add(nodes[i]);

            this.sticks[i] = new VerletStick(this.hubHead, this.nodes[i], PBMath.rand(.01, .08), 0);
            //scene.add(sticks[i]);

            let geom: BoxGeometry = new BoxGeometry(PBMath.rand(.01, .14), PBMath.rand(.01, .14), PBMath.rand(.01, .14));
            let mat: MeshPhongMaterial = new MeshPhongMaterial({ color: 0x225588 });
            this.blocks[i] = new Mesh(geom, mat);
            this.blocks[i].rotateX(PBMath.rand(-Math.PI / 15, Math.PI / 15));
            this.blocks[i].rotateY(PBMath.rand(-Math.PI / 15, Math.PI / 15));
            this.blocks[i].rotateZ(PBMath.rand(-Math.PI / 15, Math.PI / 15));
            this.add(this.blocks[i]);
        }
        // neck and head straps
        this.sticks.push(new VerletStick(this.hubNeck, this.hubHead, PBMath.rand(.75, .99), 1));
        this.sticks.push(new VerletStick(this.hubHeadStrap, this.hubHead, PBMath.rand(.75, .99), 1));

        this.sticks.push(new VerletStick(this.hubHeadStrapRight, this.hubHead, PBMath.rand(.75, .99), 1));
        this.sticks.push(new VerletStick(this.hubHeadStrapLeft, this.hubHead, PBMath.rand(.75, .99), 1));
        this.sticks.push(new VerletStick(this.hubHeadStrapFront, this.hubHead, PBMath.rand(.75, .99), 1));
        this.sticks.push(new VerletStick(this.hubHeadStrapBack, this.hubHead, PBMath.rand(.75, .99), 1));

        // Uncomment to see cross-supports
        // this.add(this.sticks[this.sticks.length - 6]);
        // this.add(this.sticks[this.sticks.length - 5]);
        // this.add(this.sticks[this.sticks.length - 4]);
        // this.add(this.sticks[this.sticks.length - 3]);
        // this.add(this.sticks[this.sticks.length - 2]);
        // this.add(this.sticks[this.sticks.length - 1]);

        this.hubHead.moveNode(new Vector3(5.2, 8.15, -4.145));

        // cross-supports
        let randNodeindex = 0;
        for (let i = 0, k = 0, l = 0; i < this.nodes.length; i++) {
            let val = Math.floor(Math.random() * (this.nodes.length - 1));
            if (i % 3 === 0 && i !== val) {
                this.sticks.push(new VerletStick(this.nodes[i], this.nodes[val], 1, 0));
            }
            // hairs
            // to do
        }
    }

    live() {
        this.hubHead.verlet();
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].verlet();
            this.blocks[i].position.x = this.nodes[i].position.x
            this.blocks[i].position.y = this.nodes[i].position.y += this.gravity;
            this.blocks[i].position.z = this.nodes[i].position.z
        }
        // if (Math.floor(Math.random() * 120) == 5) {
        //     hubHead.moveNode(new Vector3(PBMath.rand(-30, 30), PBMath.rand(-30, 30), PBMath.rand(-30, 30)));
        // }

        for (let s of this.sticks) {
            s.constrainLen();
        }
    }
}