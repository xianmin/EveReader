import datebase from '../datebase';

export default {
  namespaced: true,

  state: {
    fontSize: 18,
    lineHeight: 1.8,
    pageWidth: 900,
    backgroundColor: '#FFFFFF',
  },

  getters: {
    fontSize: state => state.fontSize,
    lineHeight: state => state.lineHeight,
    pageWidth: state => state.pageWidth,
    backgroundColor: state => state.backgroundColor,
  },

  mutations: {
    'SET_EBOOK_SETTING': (state, setting) => {
      for (let i in state) {
        state[i] = setting[i];
      }
    },
    'SET_EBOOK_FONTSIZE': (state, fontSize) => {
      state.fontSize = fontSize;
      datebase.updateSettingToDB(state);
    },
    'SET_EBOOK_LINEHEIGHT': (state, lineHeight) => {
      state.lineHeight = lineHeight;
      datebase.updateSettingToDB(state);
    },
    'SET_EBOOK_PAGEWIDTH': (state, pageWidth) => {
      state.pageWidth = pageWidth;
      datebase.updateSettingToDB(state);
    },
    'SET_EBOOK_BACKGROUND': (state, backgroundColor) => {
      state.backgroundColor = backgroundColor;
      datebase.updateSettingToDB(state);
    },
  },

  actions: {
    async initSetting({ commit, state }) {
      let setting = await datebase.getSettingFromDB();

      if (setting) {
        commit('SET_EBOOK_SETTING', setting);
      } else {
        datebase.updateSettingToDB(state);
      }
    },
  },
}
