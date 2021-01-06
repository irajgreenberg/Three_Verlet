// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall

import * as THREE from '/build/three.module.js';
import { Color, Group, Vector2, Vector3 } from '/build/three.module.js';
import { VerletNode } from './VerletNode.js';
import { VerletStick } from './VerletStick.js';
import { AnchorPoint, GeometryDetail } from './IJGUtils.js';
import { VerletStrand } from './VerletStrand.js';

// Verlet Sphere, constructed of 
// VerletNodes and VereltSticks

// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------

export class VerletSphere extends Group {
    pos: Vector3;
    spineCount: number;
    sliceCount: number;
    radii: Vector2;

    nodesOrig: VerletNode[] = []; // for convenience
    nodes: VerletNode[] = []; // for convenience
    nodesCore: VerletNode[] = []; // for convenience
    nodes2D: VerletNode[][] = [[]];
    nodes2D_orig: VerletNode[][] = [[]];
    topNode: VerletNode;
    topNodeOrig: VerletNode;
    bottomNode: VerletNode;
    bottomNodeOrig: VerletNode;
    sticks: VerletStick[] = [];
    tendrils: VerletStrand[] = [];

    // for pulsing
    pulseTheta = 0;

    constructor(pos: Vector3, radii: Vector2, spineCount: number, sliceCount: number) {
        super();
        this.pos = pos;
        this.radii = radii;
        this.spineCount = spineCount;
        this.sliceCount = sliceCount;

        //********************************
        //******** create Nodes **********
        //********************************
        let theta = Math.PI / 2 + Math.PI / sliceCount; //for Z-axis rot // start at top
        let phi = 0; // for Y-axis rot


        // top node
        // let tn = new Vector3(this.pos.x + Math.cos(Math.PI / 2) * radii.x, this.pos.y + Math.sin(Math.PI / 2) * radii.y, 0);
        // this.topNode = new VerletNode(tn, .008, new Color(0x777777), GeometryDetail.SPHERE_LOW, false);
        // let tn2 = new Vector3(this.pos.x + Math.cos(Math.PI / 2) * radii.x, this.pos.y + Math.sin(Math.PI / 2) * radii.y, 0);
        // this.topNodeOrig = new VerletNode(tn2, .008, new Color(0x777777), GeometryDetail.SPHERE_LOW, false);
        // // add nodes to Group
        // this.add(this.topNode);

        let k = 0; // convenience counter
        for (var i = 1; i < sliceCount; i++) { // calc edge nodes
            let x = this.pos.x + Math.cos(theta) * radii.x;
            let y = this.pos.y + Math.sin(theta) * radii.y;
            let z = this.pos.z;


            // core
            let xCore = this.pos.x + Math.cos(theta) * radii.x * .95;
            let yCore = this.pos.y + Math.sin(theta) * radii.y * .95;
            let zCore = this.pos.z;
            // reference from https://www.cs.helsinki.fi/group/goa/mallinnus/3dtransf/3drota.htm?fbclid=IwAR3Aswr53TiyZQaj--LCm_LvBJQO7SB20vGADa08e1vyKcE9MOhvMO3SVVw#3D%20Rotation
            //z' = z*cos q - x*sin q
            //x' = z*sin q + x*cos q
            //y' = y
            this.nodes2D.push(new Array());
            //this.nodes2D_orig.push(new Array());
            for (var j = 0; j < spineCount; j++) { // rotate and collect edge nodes
                k = spineCount * i + j;
                let v = new Vector3(
                    z * Math.sin(phi) + x * Math.cos(phi),
                    y,
                    z * Math.cos(phi) - x * Math.sin(phi)
                );

                let vCore = new Vector3(
                    zCore * Math.sin(phi) + xCore * Math.cos(phi),
                    yCore,
                    zCore * Math.cos(phi) - xCore * Math.sin(phi)
                );
                let v2 = new Vector3(
                    z * Math.sin(phi) + x * Math.cos(phi),
                    y,
                    z * Math.cos(phi) - x * Math.sin(phi)
                );

                let v2Core = new Vector3(
                    zCore * Math.sin(phi) + xCore * Math.cos(phi),
                    yCore,
                    zCore * Math.cos(phi) - xCore * Math.sin(phi)
                );
                let vn = new VerletNode(v, .008, new Color(0x777777), GeometryDetail.SPHERE_LOW, false);
                let vnOrig = new VerletNode(v, .008, new Color(0x777777), GeometryDetail.SPHERE_LOW, false);
                let vnCore = new VerletNode(vCore, .008, new Color(0x777777), GeometryDetail.SPHERE_LOW, false);
                this.nodes2D[i].push(vn);
                this.nodes.push(vn);
                this.nodesOrig.push(vnOrig);
                this.nodesCore.push(vnCore);
                //this.nodes2D_orig[i].push(vn);
                //this.add(vn);
                phi += Math.PI * 2 / spineCount; // move around Y-axis


            }
            //}
            theta += Math.PI / sliceCount; // move 1/2 around Z-axis
        }
        // top node
        // let bn = new Vector3(this.pos.x + Math.cos(-Math.PI / 2) * radii.x, this.pos.y + Math.sin(-Math.PI / 2) * radii.y, 0);
        // this.bottomNode = new VerletNode(bn, .008, new Color(0x777777), GeometryDetail.SPHERE_LOW, false);
        // let bn2 = new Vector3(this.pos.x + Math.cos(-Math.PI / 2) * radii.x, this.pos.y + Math.sin(-Math.PI / 2) * radii.y, 0);
        // this.bottomNodeOrig = new VerletNode(bn2, .008, new Color(0x777777), GeometryDetail.SPHERE_LOW, false);
        // // add nodes to Group
        // this.add(this.bottomNode);

        // add to top and bottom nodesarrays
        // this.nodes.unshift(this.topNode);
        // this.nodesOrig.unshift(this.topNodeOrig);
        // this.nodes.push(this.bottomNode);
        // this.nodesOrig.push(this.bottomNodeOrig);

        //********************************
        //******** Create Sticks *********
        //********************************
        //constructor(start: VerletNode, end: VerletNode, stickTension: number = .4, anchorTerminal: number = 0, isVisible: boolean = true)
        for (var i = 1; i < sliceCount; i++) { // calc edge nodes
            for (var j = 0; j < spineCount; j++) { // rotate and collect edge nodes
                if (j < spineCount - 1) {
                    let vs1 = new VerletStick(this.nodes2D[i][j], this.nodes2D[i][j + 1], .035, 0);
                    this.sticks.push(vs1);
                    this.add(vs1)
                    if (i < sliceCount - 1) {
                        let vs2 = new VerletStick(this.nodes2D[i][j + 1], this.nodes2D[i + 1][j + 1], .035, 0);
                        this.sticks.push(vs2);
                        this.add(vs2)
                    }
                } else {
                    let vs1 = new VerletStick(this.nodes2D[i][j], this.nodes2D[i][0], .035, 0);
                    this.sticks.push(vs1);
                    this.add(vs1)
                    if (i < sliceCount - 1) {
                        let vs2 = new VerletStick(this.nodes2D[i][0], this.nodes2D[i + 1][0], .035, 0);
                        this.sticks.push(vs2);
                        this.add(vs2)
                    }
                }

            }
        }
        // core keeps sphere feom collapsing
        for (var i = 0; i < this.nodes.length; i++) {
            let armature = new VerletStick(this.nodes[i], this.nodesCore[i], 1, 2);
            this.sticks.push(armature);
        }
    }

    setNodeVisibility(isNodeVisible: boolean): void {

    }

    setNodeColor(color: Color, alpha: number): void {

    }

    setStickColor(color: Color, alpha: number): void {
        for (var s of this.sticks) {
            s.setColor(color);
            s.setOpacity(alpha);
        }
    }

    addTendrils(tendrilSegments: number = 5, tendrilLength: number = .03, tendrilTension: number = 0.55): void {
        for (var i = 0; i < this.nodes.length; i++) {
            // console.log(tendrilNodes[i].position);
            this.tendrils.push(new VerletStrand(
                this.nodes[i].position,
                new Vector3(this.nodes[i].position.x * .1, this.nodes[i].position.y * .1, this.nodes[i].position.z * .1),
                tendrilSegments,
                AnchorPoint.HEAD,
                tendrilTension, GeometryDetail.TRI));

            this.add(this.tendrils[i]);
        }
    }

    setTendrilOpacity(alpha: number) {
        for (var i = 0; i < this.tendrils.length; i++) {
            this.tendrils[i].setStrandOpacity(alpha);
        }
    }



    // start verlet offeset
    push(indices: number[], vec: Vector3) {
        for (var i = 0; i < indices.length; i++) {
            this.nodes[indices[i]].position.x += vec.x;//THREE.MathUtils.randFloatSpread(vec.x);
            this.nodes[indices[i]].position.y += vec.y;
            this.nodes[indices[i]].position.z += vec.z;
        }
    }

    pulse(indices: number[], amp: number, freq: number) {
        for (var i of indices) {
            this.nodes[i].position.x = this.nodesOrig[i].position.x + Math.cos(this.pulseTheta) * amp;
            this.nodes[i].position.y = this.nodesOrig[i].position.y + Math.sin(this.pulseTheta) * amp;
            this.nodes[i].position.z = this.nodesOrig[i].position.z + Math.cos(this.pulseTheta) * amp;
            this.pulseTheta += freq;
        }
    }

    pulseIndices(indices: number[], amps: number[], freqs: number[], thetas: number[]) {
        for (var i = 0; i < indices.length; i++) {
            this.nodes[indices[i]].position.x = this.nodesOrig[indices[i]].position.x + Math.cos(thetas[i]) * amps[i];
            this.nodes[indices[i]].position.y = this.nodesOrig[indices[i]].position.y + Math.sin(thetas[i]) * amps[i];
            this.nodes[indices[i]].position.z = this.nodesOrig[indices[i]].position.z + Math.cos(thetas[i]) * amps[i];
            thetas[i] += freqs[i];
        }
    }

    verlet(): void {
        for (var n of this.nodes) {
            n.verlet();
        }
        if (this.tendrils.length > 0) {
            for (var i = 0; i < this.tendrils.length; i++) {
                this.tendrils[i].setHeadPosition(this.nodes[i].position);
                this.tendrils[i].verlet();
            }
        }
    }

    constrain(bounds: Vector3, offset: Vector3 = new Vector3()): void {
        for (var s of this.sticks) {
            s.constrainLen();
        }

        for (var n of this.nodes) {
            let v = new Vector3(bounds.x + offset.x, bounds.y + offset.y, bounds.z + offset.z);
            n.constrainBounds(v);
        }
        // if (this.tendrils.length > 0) {
        //     for (var t of this.tendrils) {
        //         t.constrainBounds(bounds, offset);
        //     }
        // }
    }
}
