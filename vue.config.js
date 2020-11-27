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

  configureWebpack: {
    devtool: 'source-map',
  },

  pluginOptions: {
    electronBuilder: {
      preload: 'src/electron/preload.js',
      builderOptions: {
        "productName": "Eve Reader",
        "appId": "com.example.yourapp",
        "fileAssociations": [{
          "ext": "epub",
          "name": "Epub",
          "description": "Epub Open eBook",
          "role": "Viewer"
        }],
        // build linux
        "linux": {
          "category": "Viewer",
          "mimeTypes": [
            "application/epub+zip"
          ],
          "target": [
            {
              "target": "Appimage"
            },
            {
              "target": "deb"
            }
          ],
          "maintainer": "Chen Xianmin",
          "artifactName": "${productName}-${version}.${ext}",
          "executableName": "eve-reader",
          "executableArgs": ["%f"],
          "desktop": {
            "Name": "Eve Reader",
            "Terminal": "false",
            "Comment": "Reader for epub E-books",
            "Categories": "Viewer"
          }
        },
        // // TODO: build mac
        // "dmg": {
        //   "artifactName": "${productName}-${version}.${ext}",
        // },
        // "mac": {
        //   "artifactName": "mac-${productName}-${version}.${ext}",
        //   "darkModeSupport": "true",
        // },
        // // TODO: build win
        // "win": {
        //   "artifactName": "win-${productName}-${version}.${ext}",
        //   "target": [{
        //     "target": "nsis",
        //     "arch": ["ia32", "x64"],
        //   }],
        //   "nsis": {
        //     "artifactName": "win-${productName}-${version}.${ext}",
        //     "perMachine": "false",
        //     "oneClick": "false",
        //     "allowToChangeInstallationDirectory": "true"
        //   },
        // },
      },
    }
  }
}
