var path = require('path');
var webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry: [
        './src/index.js'
    ],
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'bundle.js',
        publicPath: '/build/'
    },
    devtool: 'source-map',
    plugins: [
        new webpack.NoErrorsPlugin()
    ],
    resolve: {
        root: path.join(__dirname, 'src'),
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['babel-loader'],
                exclude: /node_modules/
            }
        ]
    }
};
