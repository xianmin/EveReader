module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/EveReader/'
    : '/',
  chainWebpack: config => {
    config.module
      .rule("vue")
      .use("vue-svg-inline-loader")
      .loader("vue-svg-inline-loader")
      .options({ /* ... */ });
  },
}
