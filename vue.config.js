module.exports = {
  /// "production" is for github page
  publicPath: "/EveReader/",

  // different outputDir is for eve-calibre-web project
  outputDir: process.env.NODE_ENV === "calibre" ? "../dist" : "dist",
  assetsDir: "static",

  chainWebpack: (config) => {
    config.module
      .rule("vue")
      .use("vue-svg-inline-loader")
      .loader("vue-svg-inline-loader")
      .options({
        /* ... */
      });
  },

  configureWebpack: {
    devtool: "source-map",
  },

  pluginOptions: {
    electronBuilder: {
      preload: "src/electron/preload.js",
      // builderOptions: {}, >>> options at ./electron-builder.yml
    },
  },
};
