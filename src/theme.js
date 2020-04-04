class Theme{
  constructor(rendition) {
    this.rendition = rendition;
    this.default = {
      body: {},
      '::selection': {
        'background': 'rgba(255,255,0, 0.3)'
      }
    };
  }

  updateDefault(setting) {
    this.default.body['line-height'] = setting.lineHeight + '!important';
    this.rendition.themes.registerRules("default", this.default);
    this.rendition.themes.update("default");
  }
}

export default Theme;
