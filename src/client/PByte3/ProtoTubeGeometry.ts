
// NOTES: 
// 1. TubeGeometry creates a copy of radialSegment[0]. I think this is ued for uv mapping
//    If you want to attach other geometry to tube, attachments points will be < radialSegments.length-1
// 2. Tube sections will be 1 less than vertex cross-sections (e.g. :-:, 1 tube section, 2 vertex cross-sections)
// 3. this.geometry.attributes.position.count = (radialSegments+1) * (tubeSegments+1)

import { Curve, Float32BufferAttribute, Line, TubeGeometry, Vector2, Vector3 } from "three";
import { FuncType, iCurveExpression, PBMath } from "./IJGUtils";
export class ProtoTubeGeometry extends TubeGeometry {
    // radii: number[] = []
    pathLen: number;
    tubularSegments: number;
    radialSegments: number;

    //used to precalculate curve segment lengths for non-orthogonal skeleton creation. Default bone count is 5
    boneCount: number;
    pathSegmentLengths: number[] = [];

    skeletalSpineVertices: Vector3[]= [];

    constructor(path: Curve<Vector3>, tubularSegments = 64, radialSegments = 8,
        closed = false, radExpr: iCurveExpression = { func: FuncType.NONE, min: 1, max: 1, periods: 1 }, boneCount: number = 5) {

        super(path);
        this.tubularSegments = tubularSegments;
        this.radialSegments = radialSegments;

        // generate radii basedon passed in expression
        let radii = PBMath.expression(radExpr.func, tubularSegments, radExpr.min, radExpr.max, radExpr.periods);

        this.pathLen = path.getLength();

        this.boneCount = boneCount;

        path.arcLengthDivisions = boneCount;
        this.pathSegmentLengths = path.getLengths();
        // console.log("overall curve length = ", path.getLength());
        // console.log("this.pathSegmentLengths = ", this.pathSegmentLengths);

        // Do I even need the parameters stuff?
        this.type = 'TubeVariableRadiiGeometry';

        this.parameters = {
            path: path,
            tubularSegments: tubularSegments,
            radius: radii[0],
            radialSegments: radialSegments,
            closed: closed
        };

        const frames = path.computeFrenetFrames(tubularSegments, closed);
        // expose internals

        this.tangents = frames.tangents;
        this.normals = frames.normals;
        this.binormals = frames.binormals;

        // helper variables

        const vertex = new Vector3();
        const normal = new Vector3();
        const uv = new Vector2();
        let P = new Vector3();

        // buffer

        const vertices: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        // create buffer data

        generateBufferData();

        // Collect points for spineSkeleton

        for (let i = 0; i < this.tubularSegments; i++) {
            P = path.getPointAt(i / this.tubularSegments, P);
             this.skeletalSpineVertices.push(P);
        }

        // build geometry

        this.setIndex(indices);
        this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
        this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

        // create spine based on tube vertices
        
        //createSkeletalSpine();

        // functions

        function generateBufferData() {
            for (let i = 0; i < tubularSegments; i++) {

                generateSegment(i);

            }

            // if the geometry is not closed, generate the last row of vertices and normals
            // at the regular position on the given path
            //
            // if the geometry is closed, duplicate the first row of vertices and normals (uvs will differ)

            generateSegment((closed === false) ? tubularSegments : 0);

            // uvs are generated in a separate function.
            // this makes it easy compute correct values for closed geometries

            generateUVs();

            // finally create faces

            generateIndices();

        }

        function generateSegment(i: number) {

            // we use getPointAt to sample evenly distributed points from the given path

            P = path.getPointAt(i / tubularSegments, P);

            // retrieve corresponding normal and binormal
            const N = frames.normals[i];
            const B = frames.binormals[i];

            // use radius per segment       
            // const radius = radii[i];

            //const radius = Math.abs(Math.sin(i * Math.PI / 120) * 55);
            let radius = radii[i];
            // fix to avoid uneven raddii and tube segments
            if (radius === undefined) {
                radius = radii[radii.length - 1];
            }
            //console.log(radius);
            // generate normals and vertices for the current segment
            for (let j = 0; j <= radialSegments; j++) {

                const v = j / radialSegments * Math.PI * 2;

                const sin = Math.sin(v);
                const cos = - Math.cos(v);

                // normal
                normal.x = (cos * N.x + sin * B.x);
                normal.y = (cos * N.y + sin * B.y);
                normal.z = (cos * N.z + sin * B.z);
                normal.normalize();

                normals.push(normal.x, normal.y, normal.z);

                // vertex
                vertex.x = P.x + (radius) * normal.x;
                vertex.y = P.y + (radius) * normal.y;
                vertex.z = P.z + (radius) * normal.z;

                vertices.push(vertex.x, vertex.y, vertex.z);

            }

        }

        function generateIndices() {

            for (let j = 1; j <= tubularSegments; j++) {

                for (let i = 1; i <= radialSegments; i++) {

                    const a = (radialSegments + 1) * (j - 1) + (i - 1);
                    const b = (radialSegments + 1) * j + (i - 1);
                    const c = (radialSegments + 1) * j + i;
                    const d = (radialSegments + 1) * (j - 1) + i;

                    // faces

                    indices.push(a, b, d);
                    indices.push(b, c, d);

                }

            }

        }

        function generateUVs() {

            for (let i = 0; i <= tubularSegments; i++) {

                for (let j = 0; j <= radialSegments; j++) {

                    uv.x = i / tubularSegments;
                    uv.y = j / radialSegments;

                    uvs.push(uv.x, uv.y);

                }

            }

        }

        // function createSkeletalSpine(this: any){

        //     if (this) {
        //         let position = this.spineMesh.geometry.attributes.position;
        //         for (let i = 0, k = 0; i < position.count; i += (this.spineGeom.radialSegments + 1)) {
        //             let vec = new Vector3();
        //             for (let j = 0; j <= this.spineGeom.radialSegments; j++) {
        //                 let l = i + j;
        //                 vec.add(new Vector3(this.bufferClone.getX(l), this.bufferClone.getY(l), this.bufferClone.getZ(l)));
        //             }
        //             vec.divideScalar(this.spineGeom.radialSegments);
        //             this.bufferSpineVecs.push(vec);
        //             this.bufferSpineVecsInit.push(vec);
        //         }
        //     }


        // }
    }
    toJSON() {

        const data = super.toJSON();

        data.path = this.parameters.path.toJSON();

        return data;

    }
}

    // static fromJSON(data:Object) {

    //     // This only works for built-in curves (e.g. CatmullRomCurve3).
    //     // User defined curves or instances of CurvePath will not be deserialized.
    //     return new TubeGeometry(
    //         new Curves[data.path.type]().fromJSON(data.path),
    //         data.tubularSegments,
    //         data.radius,
    //         data.radialSegments,
    //         data.closed
    //     );
    // }



