// ProtoBytes
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

//! NOTE: This class is derived from three.js RingGeometry

import {
  BufferGeometry,
  Float32BufferAttribute,
  Vector2,
  Vector3,
} from "three";
import { cos, PI } from "./IJGUtils";
import { VerletNode } from "./VerletNode";
import { VerletStick } from "./VerletStick";

// vars for testing
let theta = 0;
let freq = PI / 180;
let amp = 1.15;

export class VerletAnnulusGeometry2 extends BufferGeometry {
  attachmentEdge: Vector3[] = [];

  // for anchoring annulus to Protube
  nodes: VerletNode[] = [];
  sticks: VerletStick[] = [];

  // For mapping Verlet Nodes to Annulus geometry
  nodes2: VerletNode[] = [];

  headNodes: VerletNode[] = [];
  headNodesInit: VerletNode[] = []; // for testing
  tailNodes: VerletNode[] = [];

  radialSegments: number;
  bandSegments: number;

  constructor(
    innerRadius = 0.5,
    outerRadius = 1,
    thetaSegments = 8,
    phiSegments = 1,
    thetaStart = 0,
    thetaLength = Math.PI * 2
  ) {
    super();

    thetaSegments = Math.max(3, thetaSegments);
    phiSegments = Math.max(1, phiSegments);

    this.bandSegments = phiSegments;
    this.radialSegments = thetaSegments;

    // buffers
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    // some helper variables
    let radius = innerRadius;
    const radiusStep = (outerRadius - innerRadius) / phiSegments;
    const vertex = new Vector3();
    const uv = new Vector2();

    // generate vertices, normals and uvs
    // Begin with band segments
    for (let j = 0; j <= phiSegments; j++) {
      // rotate around radial segments
      for (let i = 0; i <= thetaSegments; i++) {
        // values are generate from the inside of the ring to the outside
        const segment = thetaStart + (i / thetaSegments) * thetaLength;

        // vertex
        vertex.x = radius * Math.cos(segment);
        vertex.y = radius * Math.sin(segment);

        vertices.push(vertex.x, vertex.y, vertex.z);

        // Verlet Nodes
        if (i < thetaSegments) {
          this.nodes.push(
            new VerletNode(new Vector3(vertex.x, vertex.y, vertex.z))
          );
          if (j == 0) {
            this.headNodes.push(this.nodes[this.nodes.length - 1]);
            this.headNodesInit.push(this.nodes[this.nodes.length - 1]);
          } else if (j == phiSegments) {
            this.tailNodes.push(this.nodes[this.nodes.length - 1]);
          }
        }

        // verlet sticks around radii segments
        if (i > 0) {
          if (i < thetaSegments) {
            this.sticks.push(
              new VerletStick(
                this.nodes[this.nodes.length - 2],
                this.nodes[this.nodes.length - 1]
              )
            );
          } else {
            this.sticks.push(
              new VerletStick(
                this.nodes[this.nodes.length - 1],
                this.nodes[thetaSegments * j]
              )
            );
          }
        }

        // normal
        normals.push(0, 0, 1);

        // uv
        uv.x = (vertex.x / outerRadius + 1) / 2;
        uv.y = (vertex.y / outerRadius + 1) / 2;

        uvs.push(uv.x, uv.y);
      }

      // increase the radius for next row of vertices
      radius += radiusStep;
    }

    //sticks across bands
    for (let i = 0, k = 0; i < thetaSegments; i++) {
      for (let j = 0; j < phiSegments; j++) {
        k = phiSegments * i + j;
        //if(j>0){
        this.sticks.push(
          new VerletStick(
            this.nodes[i + thetaSegments * j],
            this.nodes[i + thetaSegments * (j + 1)]
          )
        );
        // }
      }
    }

    // cross supports for stability
    let n: VerletStick | undefined;
    let tailNodesLen = this.tailNodes.length % 2 == 0 ? this.tailNodes.length : this.tailNodes.length - 1;
    let shim = this.tailNodes.length % 2 == 0 ? 0 : 1;

    for (let i = 0; i < tailNodesLen / 2 + shim; i++) {
      n = new VerletStick(this.tailNodes[i], this.tailNodes[tailNodesLen / 2 + i]);
      n.setOpacity(0);
      this.sticks.push(n!);
      //this.add(n!);
    }


    // indices
    for (let j = 0; j < phiSegments; j++) {
      const thetaSegmentLevel = j * (thetaSegments + 1);

      for (let i = 0; i < thetaSegments; i++) {
        const segment = i + thetaSegmentLevel;

        const a = segment;
        const b = segment + thetaSegments + 1;
        const c = segment + thetaSegments + 2;
        const d = segment + 1;

        // faces
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    // build geometry
    this.setIndex(indices);
    this.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    this.setAttribute("normal", new Float32BufferAttribute(normals, 3));
    this.setAttribute("uv", new Float32BufferAttribute(uvs, 2));

    // Node references for Annulus geometry
    // required as geometry doubles up points on seem,
    // but both overlappingpoints should be controlled by same verlet node.

    // copy references between 2 node arrays
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes2[i] = this.nodes[i];
    }
    // add additional nodes to enable verlet control
    for (let i = 0; i <= this.bandSegments; i++) {
      this.nodes2.splice(this.radialSegments * (i + 1) + i, 0, this.nodes[this.radialSegments * i]);
    }

  }

  verlet(): void {
    // this.nodes[0].position.x = 0.1;
    // this.nodes[1].position.x += 0.9;
    // this.nodes[2].position.x += 0.1;
    // this.nodes[3].position.x += 0.1;
    for (let i = 0; i < this.headNodes.length; i++) {
      // this.headNodes[i].position.z = this.headNodesInit[i].position.z + cos(theta) * amp;
    }
    theta += freq;
    //this.headNodes[2].position.x += .1;
    for (let i = 0; i <= this.bandSegments; i++) {
      for (let j = 0; j < this.radialSegments; j++) {
        let k = i * this.radialSegments + j;
        if (i > 0) {
          this.nodes[k].verlet();
        }
      }
    }

    // for (let i = 0; i < this.nodes.length; i++) {

    //     if (i != 0) {
    //         this.nodes[i].verlet();
    //     }
    // }
    for (let s of this.sticks) {
      s.constrainLen();
    }
  }
}
