const path = require('path');

module.exports = {
    /**************** Project Entries ******************/
    // entry: './src/client/Restroyocity/sketch.ts', 
    // entry: './src/client/FurrySkeleton/sketch.ts',
    entry: './src/client/HairyLimb/sketch.ts',
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