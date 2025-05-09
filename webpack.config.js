const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        mode: isProduction ? 'production' : 'development',
        entry: {
            popup: './src/views/popup/popup.ts',
            background: './src/background.ts',
            options: './src/views/options/options.ts',
        },
        output: {
            path: path.resolve(__dirname, isProduction ? 'dist-prod' : 'dist'),
            filename: '[name].js',
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    {from: "src/views/popup/popup.html", to: "popup.html"},
                    {from: "src/views/options/options.html", to: "options.html"},
                    {from: "src/utils/styles", to: "styles"},
                    {from: "icons", to: "icons"},
                    {from: "manifest.json", to: "manifest.json"},
                ],
            }),
        ],
        devtool: isProduction ? false : 'cheap-source-map',
        optimization: {
            minimize: isProduction,
            // Add any other optimization settings for production
        },
    };
}; 