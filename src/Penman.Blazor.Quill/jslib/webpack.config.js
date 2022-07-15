const path = require("path");

module.exports = {
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/i,
                use: {
                    loader: "css-loader"
                }
            }
        ]
    },
    devtool: 'eval-source-map',
    output: {
        path: path.resolve(__dirname, '../wwwroot/'),
        filename: "penman-blazor-quill.js",
        library: "PenmanBlazorQuill"
    }
};