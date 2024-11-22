module.exports = {
    // ... other config
    module: {
      rules: [
        {
          test: /\.(mp3|wav)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              outputPath: 'assets/sounds/'
            }
          }
        }
      ]
    }
  };