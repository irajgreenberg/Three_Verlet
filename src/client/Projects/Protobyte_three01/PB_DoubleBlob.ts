// import { BufferGeometry, CatmullRomCurve3, Group, Line, LineBasicMaterial, Vector3 } from "three";

// export class PB_DoubleBlob extends Group {
//     constructor() {
//         super();

//         //Create a closed wavey loop
//         const curve = new CatmullRomCurve3([
//             new Vector3(-10, 0, 10),
//             new Vector3(-5, 5, 5),
//             new Vector3(0, 0, 0),
//             new Vector3(5, -5, 5),
//             new Vector3(10, 0, 10)
//         ]);

//         const points = curve.getPoints(50);
//         const geometry = new BufferGeometry().setFromPoints(points);

//         const material = new LineBasicMaterial({ color: 0xff0000 });

//         // Create the final object to add to the scene
//         const curveObject = new Line(geometry, material);

//         const geometry = new ProtoTubeGeometry(points, tubeSegs, radii, 12, false);
//         const material = new MeshPhongMaterial({ color: 0xffffff, wireframe: false, side: DoubleSide, map: texture, transparent: true, opacity: 1, bumpMap: texture, bumpScale: 3, shininess: 60 });
//         const mesh = new Mesh(geometry, material);
//         this.add(mesh);

//     }
// }