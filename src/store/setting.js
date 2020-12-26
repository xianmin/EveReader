import database from '../database';

export default {
  namespaced: true,

  state: {
    fontSize: 18,
    lineHeight: 1.8,
    pageWidth: 900,
    backgroundColor: '#FFFFFF',
    annotatorColorList: ['red', 'orange', 'yellow', 'green', 'blue'],
    // reader state keeper
    sidebarVisible: '',
    sidebarWidth: 25,
  },

  getters: {
    fontSize: state => state.fontSize,
    lineHeight: state => state.lineHeight,
    pageWidth: state => state.pageWidth,
    backgroundColor: state => state.backgroundColor,
    annotatorColorList: state => state.annotatorColorList,
    sidebarVisible: state => state.sidebarVisible,
    sidebarWidth: state => state.sidebarWidth,
  },

  mutations: {
    'SET_EBOOK_SETTING': (state, setting) => {
      for (let i in setting) {
        state[i] = setting[i];
      }
    },
  },

  actions: {
    async initSetting({ commit, state }) {
      let setting = await database.getSettingFromDB();

      if (setting) {
        commit('SET_EBOOK_SETTING', setting);
      } else {
        database.updateSettingToDB(state);
      }
    },

    setEbookSetting({ commit, state, dispatch }, setting) {
      commit('SET_EBOOK_SETTING', setting);
      dispatch('refreshEbookViewReady', null, { root: true });
      database.updateSettingToDB(state);
    },
  },
}
