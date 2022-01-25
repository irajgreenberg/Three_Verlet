// // Grows interactive hair on box
// // Author: Ira Greenberg, 10/2021
// // Center of Creative Computation, SMU
// // Dependencies: PByte.js, Three.js,


// /*
// 4*-------5*\
// | \       | \
// |  \*1----|-*0
// |   |     |  |
// 7*--|---6*\  |
//   \ |      \ |
//    *2-------*3
// */
// // Box indexing
// // 12 Triangle faces
// // CCW winding


// export class HairyBlock{

//     constructor(pos, sz, springiness, col) {
//         this.pos = pos;
//         this.sz = sz;
//         this.springiness = springiness;
//         this.col = col;
//         console.log("typeof springiness = ", typeof this.springiness);

//         // initialize style properties
//         this.nodeRadius = 1;
//         this.nodeCol = color(150, 34, 150);
//         this.stickCol = color(150, 150, 0);


//         this.indicies = [
//             [0, 5, 1],
//             [1, 5, 4],
//             [2, 1, 4],
//             [7, 2, 4],
//             [0, 1, 3],
//             [2, 3, 1],
//             [0, 3, 6],
//             [0, 6, 5],
//             [4, 5, 6],
//             [4, 6, 7],
//             [3, 6, 7],
//             [3, 7, 2]
//         ];

//         this.stickIndices = [
//             //F
//             [0, 1],
//             [1, 2],
//             [2, 3],
//             [3, 0],
//             //L
//             [1, 4],
//             [4, 7],
//             [7, 2],
//             [2, 1],
//             //B
//             [4, 5],
//             [5, 6],
//             [6, 7],
//             [7, 4],
//             //R
//             [5, 0],
//             [0, 3],
//             [3, 6],
//             [6, 5],
//             //T
//             [5, 4],
//             [4, 1],
//             [1, 0],
//             [0, 5],
//             //B
//             [7, 6],
//             [6, 3],
//             [3, 2],
//             [2, 7]
//         ];


//     }