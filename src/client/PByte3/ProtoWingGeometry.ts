import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";

export class ProtoWingGeometry extends BufferGeometry {
    dimenion: Vector3;
    segments: Vector3;

    constructor(dimenion: Vector3, segments: Vector3) {
        //width?: number, height?: number, widthSegments?: number, heightSegments?: number
        super();
        this.dimenion = dimenion;
        this.segments = segments;

        const width_half = this.dimenion.x / 2;
        const height_half = this.dimenion.y / 2;

        const gridX = Math.floor(this.segments.x);
        const gridY = Math.floor(this.segments.y);

        const gridX1 = gridX + 1;
        const gridY1 = gridY + 1;

        const segment_width = this.dimenion.x / gridX;
        const segment_height = this.dimenion.y / gridY;

        //

        const indices = [];
        const vertices = [];
        const normals = [];
        const uvs = [];

        for (let iy = 0; iy < gridY1; iy++) {

            const y = iy * segment_height - height_half;

            for (let ix = 0; ix < gridX1; ix++) {

                const x = ix * segment_width - width_half;

                vertices.push(x, - y, 0);

                normals.push(0, 0, 1);

                uvs.push(ix / gridX);
                uvs.push(1 - (iy / gridY));

            }

        }

        for (let iy = 0; iy < gridY; iy++) {

            for (let ix = 0; ix < gridX; ix++) {

                const a = ix + gridX1 * iy;
                const b = ix + gridX1 * (iy + 1);
                const c = (ix + 1) + gridX1 * (iy + 1);
                const d = (ix + 1) + gridX1 * iy;

                indices.push(a, b, d);
                indices.push(b, c, d);

            }

        }

        this.setIndex(indices);
        this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
        this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    }

}