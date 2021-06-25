// This class supports development
// of an 'independent' softbody organism.
// Project is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall

// Simple verlet node
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------

//import { Mesh, Vector3, Color, CircleBufferGeometry, MeshBasicMaterial, TetrahedronBufferGeometry, MeshPhongMaterial, BoxBufferGeometry,
// OctahedronBufferGeometry, IcosahedronBufferGeometry, DodecahedronBufferGeometry, SphereBufferGeometry, DoubleSide } from 'three';
import { Mesh, Vector3, Color, CircleBufferGeometry, MeshBasicMaterial, TetrahedronBufferGeometry, MeshPhongMaterial, BoxBufferGeometry,
    OctahedronBufferGeometry, IcosahedronBufferGeometry, DodecahedronBufferGeometry, SphereBufferGeometry, DoubleSide } from '/build/three.module.js';
import { GeometryDetail } from './IJGUtils.js';

export class VerletNode extends Mesh {

  private posOld: Vector3;
  private radius: number; //for conveneince
  color: Color;
  isNodeVisible: boolean;

  constructor(pos: Vector3, radius: number = 0.005, color: Color = new Color(.5, .5, .5), geomDetail: GeometryDetail = GeometryDetail.SPHERE_LOW, isNodeVisible: boolean = true) {

    // determine node geometry
    let geom;
    let mat;
    switch (geomDetail) {
      case GeometryDetail.TRI:
        geom = new CircleBufferGeometry(radius, GeometryDetail.TRI);
        mat = new MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.QUAD:
        geom = new CircleBufferGeometry(radius, GeometryDetail.QUAD);
        mat = new MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.PENT:
        geom = new CircleBufferGeometry(radius, GeometryDetail.PENT);
        mat = new MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.HEX:
        geom = new CircleBufferGeometry(radius, GeometryDetail.HEX);
        mat = new MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.HEP:
        geom = new CircleBufferGeometry(radius, GeometryDetail.HEP);
        mat = new MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.OCT:
        geom = new CircleBufferGeometry(radius, GeometryDetail.OCT);
        mat = new MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.DEC:
        geom = new CircleBufferGeometry(radius, GeometryDetail.DEC);
        mat = new MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.DODEC:
        geom = new CircleBufferGeometry(radius, GeometryDetail.DODEC);
        mat = new MeshBasicMaterial({ color: color });
        break;
      case GeometryDetail.TETRA:
        geom = new TetrahedronBufferGeometry(radius);
        mat = new MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.CUBE:
        geom = new BoxBufferGeometry(radius, radius, radius);
        mat = new MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.OCTA:
        geom = new OctahedronBufferGeometry(radius);
        mat = new MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.ICOSA:
        geom = new IcosahedronBufferGeometry(radius);
        mat = new MeshPhongMaterial({ color: color, wireframe: true });
        // mat = new MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.DODECA:
        geom = new DodecahedronBufferGeometry(radius);
        break;
      case GeometryDetail.SPHERE_LOW:
        geom = new SphereBufferGeometry(radius, 8, 8);
        mat = new MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.SPHERE_MED:
        geom = new SphereBufferGeometry(radius, 12, 12);
        mat = new MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.SPHERE_HIGH:
        geom = new SphereBufferGeometry(radius, 18, 18);
        mat = new MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.SPHERE_SUPERHIGH:
        geom = new SphereBufferGeometry(radius, 24, 24);
        mat = new MeshPhongMaterial({ color: color });
        break;
      case GeometryDetail.SPHERE_SUPERDUPERHIGH:
        geom = new SphereBufferGeometry(radius, 32, 32);
        mat = new MeshPhongMaterial({ color: color });
        break;
      default:
        geom = new CircleBufferGeometry(radius, GeometryDetail.TRI);
        mat = new MeshBasicMaterial({ color: color });
    }

    //super(geom, new MeshBasicMaterial({ color: color }));
    super(geom, mat);

    // console.log(geomDetail);
    if (geomDetail < 13) { // show backs of poly nodes
      let mat = this.material as MeshBasicMaterial;
      mat.side = DoubleSide;
    }
    this.radius = radius;
    this.color = color;
    this.isNodeVisible = isNodeVisible;
    this.position.set(pos.x, pos.y, pos.z);
    this.posOld = this.position.clone();
  }

  // Start motion with node offset
  moveNode(vec: Vector3): void {
    this.position.add(vec);
  }

  // Motion determined by position comparison between current and previus frames
  verlet(): void {
    let posTemp1: Vector3 = new Vector3(this.position.x, this.position.y, this.position.z);
    this.position.x += (this.position.x - this.posOld.x);
    this.position.y += (this.position.y - this.posOld.y);
    this.position.z += (this.position.z - this.posOld.z);
    this.posOld.copy(posTemp1);
  }

  resetVerlet(): void {
    this.posOld = this.position.clone();
  }

  constrainBounds(bounds: Vector3): void {
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

  setNodeColor(color: Color): void {
    let mat = this.material as MeshBasicMaterial;
    mat.color = color;
  }

  setNodeAlpha(alpha: number): void {
    let mat = this.material as MeshBasicMaterial;
    mat.transparent = true;
    mat.opacity = alpha;
  }

  // redundant and should probably be changed not adding/removing nodes to/from scene
  setNodeVisible(isNodeVisible: boolean): void {
    let mat = this.material as MeshBasicMaterial;
    if (isNodeVisible) {
      mat.transparent = false;
      mat.opacity = 1.0;
    } else {
      mat.transparent = true;
      mat.opacity = 0.0;
    }

  }
}