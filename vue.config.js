module.exports = {
  // "production" is for github page
  publicPath: process.env.NODE_ENV === 'production'
    ? '/EveReader/'
    : '/',
  
  // different outputDir is for eve-calibre-web project
  outputDir: process.env.NODE_ENV === 'calibre' ? '../dist' : 'dist',
  assetsDir: 'static',

  chainWebpack: config => {
    config.module
      .rule("vue")
      .use("vue-svg-inline-loader")
      .loader("vue-svg-inline-loader")
      .options({ /* ... */ });
  },

  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
    }
  }
}
