class Theme{
  constructor(rendition) {
    this.rendition = rendition;
    this.default = {
      body: {
        margin: '0 auto !important;',
        padding: '0 !important;',
      },
      '::selection': {
        'background': 'rgba(255,255,0, 0.3)'
      }
    };
  }

  updateDefault(setting) {
    this.default.body['line-height'] = setting.lineHeight + '!important';
    this.default.body['max-width'] = setting.pageWidth + '!important';
    this.rendition.themes.registerRules("default", this.default);
    this.rendition.themes.update("default");
  }
}

export default Theme;
