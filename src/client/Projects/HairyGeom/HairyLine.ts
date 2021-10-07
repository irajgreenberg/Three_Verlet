import { BufferGeometry, Color, Group, Line, LineBasicMaterial, Vector3 } from "three";
import { AnchorPoint } from "../../PByte3/IJGUtils";
import { VerletStrand } from "../../PByte3/VerletStrand";

export class HairyLine extends Group {

    tendrils: VerletStrand[] = [];

    // number of hairs along line
    lineSegs: number;

    // number of nodes on each hair
    hairSegs;

    // for growing:
    nodeScale = 1;
    isNodeScalable = true;

    nodeAlpha = 0;
    isNodeAlphable = true;

    strandAlpha = 0;
    isStrandAlphable = true;

    constructor(term0: Vector3, term1: Vector3, lineSegs: number, hairSegs: number) {
        super();

        // line
        const pts = [];
        pts.push(term0);
        pts.push(term1);

        const geom = new BufferGeometry().setFromPoints(pts);
        const mat = new LineBasicMaterial({ color: 0xEE8811 });
        const line = new Line(geom, mat);
        //  this.add(line); // add to Group

        // tendrils
        this.lineSegs = lineSegs;
        //temporary
        this.hairSegs = hairSegs;
        const lineGap = new Vector3(pts[1].x, pts[1].y, pts[1].z);
        lineGap.sub(pts[0]);
        lineGap.divideScalar(lineSegs);

        // const tendrils: VerletStrand[] = [];
        for (let i = 0; i < lineSegs; i++) {
            this.tendrils[i] = new VerletStrand(new Vector3(pts[0].x + lineGap.x * i, pts[0].y, pts[0].z),
                new Vector3(pts[0].x + lineGap.x * i, pts[0].y + Math.random() * .3, pts[0].z + Math.random() * .3),
                this.hairSegs, AnchorPoint.HEAD, .3);
            this.add(this.tendrils[i]);

            // defaults
            this.tendrils[i].moveNode(1, new Vector3(-3 + Math.random() * 3, -3 + Math.random() * 3, -3 + Math.random() * 3));
            this.tendrils[i].setNodesScale(5);
            this.tendrils[i].setStrandMaterials(new Color(0xFFEEFF), .35);
            this.tendrils[i].setStrandOpacity(0); // start with invisible hair
            this.tendrils[i].setNodesOpacity(0); // start with invisible nodes
        }
        //this.anchorPoint = lineSegs-2;
    }

    live() {
        for (let i = 0; i < this.lineSegs; i++) {
            this.tendrils[i].verlet();
        }

    }

    grow() {
        if (this.isNodeScalable) {
            this.setNodeScale(this.nodeScale);
        }
        if (this.isNodeAlphable) {
            this.setNodeOpacity(this.nodeAlpha);
        }
        if (this.isStrandAlphable) {
            this.setHairOpacity(this.strandAlpha);
        }


        //NOTE: create vars in place of these magic nums.
        if ((this.nodeScale += .001) > 1.058) {
            this.isNodeScalable = false;
        }

        if ((this.nodeAlpha += .05) > .85) {
            this.isNodeAlphable = false;
        }

        if ((this.strandAlpha += .05) > 1) {
            this.isStrandAlphable = false;
        }

    }

    // takes new terminal coords
    // interpolates all  tendril insertion points
    update(start: Vector3, end: Vector3) {
        this.tendrils[0].moveToNode(0, start);
        this.tendrils[this.tendrils.length - 1].moveToNode(0, end);
        let deltaVec = new Vector3().subVectors(end, start);
        let deltaVecStep = deltaVec.divideScalar(this.tendrils.length - 1);
        for (let i = 0; i < this.tendrils.length; i++) {
            let v = new Vector3(deltaVecStep.x, deltaVecStep.y, deltaVecStep.z);
            v.multiplyScalar(i);
            this.tendrils[i].moveToNode(0, new Vector3().addVectors(start, v));
        }
    }

    move(anchorPoint: AnchorPoint, vec: Vector3) {
        let index = 0;
        if (anchorPoint == AnchorPoint.TAIL) {
            index = this.tendrils[0].segments.length;
        }
        else if (anchorPoint == AnchorPoint.HEAD) {
            index = 0;
        } else {
            index = anchorPoint;
        }

        for (let i = 0; i < this.lineSegs; i++) {
            this.tendrils[i].moveNode(index, vec);
        }
    }

    setHairMaterial(col: Color, alpha: number) {
        for (let i = 0; i < this.lineSegs; i++) {
            this.tendrils[i].setStrandMaterials(col, alpha);
            // this.tendrils[i].moveNode(index, vec);
        }

    }

    setHairColor(col: Color) {
        for (let i = 0; i < this.lineSegs; i++) {
            this.tendrils[i].setStrandColor(col);
        }
    }

    setHairOpacity(alpha: number) {
        for (let i = 0; i < this.lineSegs; i++) {
            this.tendrils[i].setStrandOpacity(alpha);
        }

    }

    setNodeScale(radius: number) {
        for (let i = 0; i < this.lineSegs; i++) {
            this.tendrils[i].setNodesScale(radius);
        }
    }

    setNodeOpacity(alpha: number) {
        for (let i = 0; i < this.lineSegs; i++) {
            this.tendrils[i].setNodesOpacity(alpha);
        }
    }


}