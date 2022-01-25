const path = require('path');

module.exports = {
    /**************** Project Entries ******************/
    //entry: './src/client/Projects/Ira/Restroyocity/sketch.ts',
    // entry: './src/client/Projects/Ira/HairyGeom/sketch.ts',
    //entry: './src/client/Projects/Ira/Organism/Organism01.ts',
    // entry: './src/client/Projects/Ira/MathTests/sketch.ts',
    // entry: './src/client/Projects/Ira/NeurotoBots/sketch.ts',
    // entry: './src/client/Projects/Ira/BaconBits/sketch.ts',
    // entry: './src/client/Projects/Ira/BaconOfTheSea/sketch.ts',
    // entry: './src/client/Projects/Ira/CustomFishGeometry/sketch.ts',
    // entry: './src/client/Projects/ProtoBytes/ProtoByte_0000/sketch.ts',
    //entry: './src/client/Projects/ProtoBytes/ProtoByte_0001/sketch.ts',
    //entry: './src/client/Projects/ProtoBytes/ProtoByte_0002/sketch.ts',
    //entry: './src/client/Projects/ProtoBytes/ProtoByte_0003/sketch.ts',
    //entry: './src/client/Projects/ProtoBytes/ProtoByte_0004_skinned_Artery/sketch.ts',
    //entry: './src/client/Projects/ProtoBytes/ProtoByte_0005_custom_deformation/sketch.ts',
    //entry: './src/client/Projects/ProtoBytes/ProtoByte_0006_custom_deformation_fins/sketch.ts',
    // entry: './src/client/Projects/ProtoBytes/Protobyte_0007_ring_to_annulus_test/sketch',
    //entry: './src/client/Projects/ProtoBytes/ProtoByte_0008_multiple_annuli/sketch.ts',
    //entry: './src/client/Projects/ProtoBytes/ProtoByte_0008_multiple_annuli/sketch2.ts',
    //entry: './src/client/Projects/Protobytes/ProtoByte_prototype_v01/sketch.ts',


    //entry: './src/client/Projects/Ira/gifDotJSTesting/sketch.ts',
    //entry: './src/client/Projects/Ira/DrawingMachine/sketch.ts',
    //entry: './src/client/Projects/Ira/Tubemergence/sketch.ts',
    //entry: './src/client/Projects/Ira/Tubemergence02/sketch.ts',
    //entry: './src/client/Projects/Ira/Tubemergence03/sketch.ts',
    // entry: './src/client/Projects/Ira/Tubemergence04/sketch.ts',
    //entry: './src/client/Projects/Ira/CollisionTesting/sketch.ts',
    // entry: './src/client/Projects/Ira/Strandom/sketch.ts',
    //entry: './src/client/Projects/Ira/ParasiticCleavage/sketch.ts',
    entry: './src/client/Projects/Ira/ParasiticEmission/sketch.ts',
    //entry: './src/client/Projects/Ira/ConstellationBuider/sketch.ts',
    //entry: './src/client/Projects/Ira/SingleCurve/sketch.ts',
    //entry: './src/client/Projects/Ira/WingStudy/sketch.ts',
    //entry: './src/client/Projects/Ira/Architecture/sketch.ts',
    //entry: './src/client/Projects/Ira/ToneExperiment/sketch.ts',
    //entry: './src/client/Projects/Ira/TowerShake/sketch.ts',





    // entry: './src/client/Projects/Truchet/sketch.ts',
    // entry: './src/client/Projects/Testing/sketch.ts',
    /************************************************ */
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        alias: {
            three: path.resolve('./node_modules/three')
        },
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../../dist/client'),
    }
};