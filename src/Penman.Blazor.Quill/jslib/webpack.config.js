const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    context: __dirname,
    entry: {
        app: './src/index.ts'
    },
    //devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, '../wwwroot'),
        filename: 'penman-blazor-quill.js',
        sourcePrefix: ''
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        mainFiles: ['index']
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin(
            {
                terserOptions: {
                    compress: true,
                },
            }
        )],
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 8080,
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'babel-loader',
                test: /\.tsx?$/,
                exclude: /node_modules/,

            },
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            },
            {
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
        },

            {
            test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
            use: [ 'url-loader' ]
        }]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    target: "web",
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        })
    ],
    mode: 'production',
    //devtool: 'eval',

    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
};