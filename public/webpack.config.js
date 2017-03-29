const { resolve } = require('path');
const webpack = require('webpack');

module.exports = {
    entry: [
        // 'react-hot-loader/patch',
        // // activate HMR for React

        // 'webpack-dev-server/client?http://localhost:8080',
        // // bundle the client for webpack-dev-server
        // // and connect to the provided endpoint

        // 'webpack/hot/only-dev-server',
        // // bundle the client for hot reloading
        // // only- means to only hot reload for successful updates
        "./entry.js",
        'whatwg-fetch'
    ],
    output: {
        path: __dirname,
        filename: "bundle.js",
        publicPath: '/'
    },
    
    module: {
        loaders: [
            { test: /\.css$/, loader: [ 'style-loader', 'css-loader' ] },
            { test: [ /\.js$/, /\.jsx$/], loader: 'babel-loader',
            query: {
                presets: ['es2015', "stage-0", "react"]
            },
            exclude: /node_modules/ },
        ]
    },
    devServer: {
        // inline:true,
        // hot: true,
        // // enable HMR on the server

        // contentBase: __dirname,
        // // match the output path

        // publicPath: '/',
        // // match the output `publicPath`

        proxy: {
            '/': {
                target: 'http://localhost:3000/',
                secure: false
            }
        }
    },
//     plugins: [
//     new webpack.HotModuleReplacementPlugin(),
//     // enable HMR globally

//     new webpack.NamedModulesPlugin(),
//     // prints more readable module names in the browser console on HMR updates
//   ],
};