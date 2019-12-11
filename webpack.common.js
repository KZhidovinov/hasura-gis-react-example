const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    entry: 'index.tsx',
    output: {
        filename: '[name].[hash].js',
        path: path.join(__dirname, 'wwwroot'),
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: ['ts-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader'
            },
            {
                test: /\.(graphql|gql)$/,
                exclude: /node_modules/,
                loader: 'graphql-tag/loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],

        modules: [
            'node_modules',
            path.join(__dirname, 'src')
        ]
    },
    plugins: [
        new Dotenv(),
        new webpack.ProgressPlugin(),
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            'process.env': Object.entries(process.env)
                .map(([k, v]) => [k, JSON.stringify(v)])
                .reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {})
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'public', 'index.html'),
        }),
    ],
    externals: ['fs'],
};