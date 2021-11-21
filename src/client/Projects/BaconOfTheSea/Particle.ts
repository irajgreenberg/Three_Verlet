import { Color, Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, SphereBufferGeometry, Vector3 } from "three";

const GRAVITY = -.001;
const DAMPING = .75;

export class Particle extends Group {
    pos: Vector3;
    radius: number;
    spd: Vector3;
    color: Color;

    part: Mesh;

    constructor(pos: Vector3, radius: number, spd: Vector3, color: Color) {
        super();
        this.pos = pos;
        this.radius = radius;
        this.spd = spd;
        this.color = color;

        const partGeom = new SphereBufferGeometry(this.radius);

        const partMat = new MeshPhongMaterial({ color: this.color });
        this.part = new Mesh(partGeom, partMat);
        this.part.receiveShadow = true;
        this.part.castShadow = true;
        this.part.position.x = pos.x;
        this.part.position.y = pos.y;
        this.part.position.z = pos.z;

        // add particle mesh to group
        this.add(this.part);
    }

    move(): void {
        this.spd.y += GRAVITY;
        this.part.position.x += this.spd.x;
        this.part.position.y += this.spd.y;
        this.part.position.z += this.spd.z;
    }

    collideBounds(bounds: Vector3) {
        if (this.part.position.x > bounds.x / 2 - this.radius) {
            this.part.position.x = bounds.x / 2 - this.radius;
            this.spd.x *= -1;
        } else if (this.part.position.x < -bounds.x / 2 + this.radius) {
            this.part.position.x = -bounds.x / 2 + this.radius;
            this.spd.x *= -1;
        }

        if (this.part.position.y < -bounds.y / 2 + this.radius) {
            this.part.position.y = -bounds.y / 2 + this.radius;
            this.spd.y *= -1;
        } else if (this.part.position.y > bounds.y / 2 - this.radius) {
            this.part.position.y = bounds.y / 2 - this.radius;
            this.spd.y *= -1;
        }

        if (this.part.position.z < -bounds.z / 2 + this.radius) {
            this.part.position.z = -bounds.z / 2 + this.radius
            this.spd.z *= -1;
        } else if (this.part.position.z > bounds.y / 2 - this.radius) {
            this.part.position.z = bounds.y / 2 - this.radius;
            this.spd.z *= -1;
        }

    }

}