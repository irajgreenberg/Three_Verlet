const path = require('path');

module.exports = {
    /**************** Project Entries ******************/
    // entry: './src/client/Projects/Restroyocity/sketch.ts', 
    // entry: './src/client/Projects/HairyGeom/sketch.ts',
    // entry: './src/client/Projects/Organism/Organism01.ts',
    // entry: './src/client/Projects/MathTests/sketch.ts',
    // entry: './src/client/Projects/NeurotoBots/sketch.ts',
    // entry: './src/client/Projects/BaconBits/sketch.ts',
    // entry: './src/client/Projects/BaconOfTheSea/sketch.ts',
    // entry: './src/client/Projects/CustomFishGeometry/sketch.ts',
    entry: './src/client/Projects/ProtoBytes/sketch.ts',
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