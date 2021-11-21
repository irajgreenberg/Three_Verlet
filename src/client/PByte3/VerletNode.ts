// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall

// Simple verlet node
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------

import * as THREE from 'three';
import { GeometryDetail } from './IJGUtils';

export class VerletNode extends THREE.Mesh {

  private posOld: THREE.Vector3;
  private radius: number; //for conveneince
  color: THREE.Color;
  isNodeVisible: boolean;
  isVerletable: boolean;

  constructor(pos: THREE.Vector3, radius: number = 0.005, color: THREE.Color = new THREE.Color(.5, .5, .5), geomDetail: GeometryDetail = GeometryDetail.SPHERE_LOW, isNodeVisible: boolean = true) {

    // determine node geometry
    let geom;
    let mat;
    switch (geomDetail) {
      case GeometryDetail.TRI:
        geom = new THREE.CircleBufferGeometry(radius, GeometryDetail.TRI);
        mat = new THREE.MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.QUAD:
        geom = new THREE.CircleBufferGeometry(radius, GeometryDetail.QUAD);
        mat = new THREE.MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.PENT:
        geom = new THREE.CircleBufferGeometry(radius, GeometryDetail.PENT);
        mat = new THREE.MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.HEX:
        geom = new THREE.CircleBufferGeometry(radius, GeometryDetail.HEX);
        mat = new THREE.MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.HEP:
        geom = new THREE.CircleBufferGeometry(radius, GeometryDetail.HEP);
        mat = new THREE.MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.OCT:
        geom = new THREE.CircleBufferGeometry(radius, GeometryDetail.OCT);
        mat = new THREE.MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.DEC:
        geom = new THREE.CircleBufferGeometry(radius, GeometryDetail.DEC);
        mat = new THREE.MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.DODEC:
        geom = new THREE.CircleBufferGeometry(radius, GeometryDetail.DODEC);
        mat = new THREE.MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.TETRA:
        geom = new THREE.TetrahedronBufferGeometry(radius);
        mat = new THREE.MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.CUBE:
        geom = new THREE.BoxBufferGeometry(radius, radius, radius);
        mat = new THREE.MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.OCTA:
        geom = new THREE.OctahedronBufferGeometry(radius);
        mat = new THREE.MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.ICOSA:
        geom = new THREE.IcosahedronBufferGeometry(radius);
        mat = new THREE.MeshPhongMaterial({ color: color, wireframe: true });
        // mat = new THREE.MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.DODECA:
        geom = new THREE.DodecahedronBufferGeometry(radius);
        break;
      case GeometryDetail.SPHERE_LOW:
        geom = new THREE.SphereBufferGeometry(radius, 8, 8);
        mat = new THREE.MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.SPHERE_MED:
        geom = new THREE.SphereBufferGeometry(radius, 12, 12);
        mat = new THREE.MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.SPHERE_HIGH:
        geom = new THREE.SphereBufferGeometry(radius, 18, 18);
        mat = new THREE.MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.SPHERE_SUPERHIGH:
        geom = new THREE.SphereBufferGeometry(radius, 24, 24);
        mat = new THREE.MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.SPHERE_SUPERDUPERHIGH:
        geom = new THREE.SphereBufferGeometry(radius, 32, 32);
        mat = new THREE.MeshPhongMaterial({ color: color });
        break;
      default:
        geom = new THREE.CircleBufferGeometry(radius, GeometryDetail.TRI);
        mat = new THREE.MeshBasicMaterial({ color: color });
    }

    //super(geom, new THREE.MeshBasicMaterial({ color: color }));
    super(geom, mat);
    if (geomDetail < 13) { // show backs of poly nodes
      let mat = this.material as THREE.MeshBasicMaterial;
      mat.side = THREE.DoubleSide;
    }
    this.radius = radius;
    this.color = color;
    this.isNodeVisible = isNodeVisible;
    this.position.set(pos.x, pos.y, pos.z);
    this.posOld = this.position.clone();
    this.isVerletable = true;
  }

  // Start motion with node offset
  moveNode(vec: THREE.Vector3): void {
    this.position.add(vec);
  }

  // Motion determined by position comparison between current and previus frames
  verlet(): void {
    if (this.isVerletable) { // enables nodes to be inactive
      let posTemp1: THREE.Vector3 = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
      this.position.x += (this.position.x - this.posOld.x);
      this.position.y += (this.position.y - this.posOld.y);
      this.position.z += (this.position.z - this.posOld.z);
      this.posOld.copy(posTemp1);
    }
  }

  resetVerlet(): void {
    this.posOld = this.position.clone();
  }

  constrainBounds(bounds: THREE.Vector3): void {
    if (this.position.x > bounds.x / 2 - this.radius) {
      this.position.x = bounds.x / 2 - this.radius;
    } else if (this.position.x < -bounds.x / 2 + this.radius) {
      this.position.x = -bounds.x / 2 + this.radius;
    }

    if (this.position.y > bounds.y / 2 - this.radius) {
      this.position.y = bounds.y / 2 - this.radius;
    } else if (this.position.y < -bounds.y / 2 + this.radius) {
      this.position.y = -bounds.y / 2 + this.radius;
    }

    if (this.position.z > bounds.z / 2 - this.radius) {
      this.position.z = bounds.z / 2 - this.radius;
    } else if (this.position.z < -bounds.z / 2 + this.radius) {
      this.position.z = -bounds.z / 2 + this.radius;
    }

  }

  setNodeColor(color: THREE.Color): void {
    let mat = this.material as THREE.MeshPhongMaterial;
    mat.color = color;
  }

  setNodeAlpha(alpha: number): void {
    let mat = this.material as THREE.MeshPhongMaterial;
    mat.transparent = true;
    mat.opacity = alpha;
  }

  // redundant and should probably be changed not adding/removing nodes to/from scene
  setNodeVisible(isNodeVisible: boolean): void {
    let mat = this.material as THREE.MeshPhongMaterial;
    if (isNodeVisible) {
      mat.transparent = false;
      mat.opacity = 1.0;
    } else {
      mat.transparent = true;
      mat.opacity = 0.0;
    }

  }
}