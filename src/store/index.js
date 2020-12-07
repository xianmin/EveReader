import Vue from 'vue'
import Vuex from 'vuex'
import setting from './setting';
import database from '../database';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ebook: null,
    lastCfi: 0,
  },
  getters: {
    ebook: state => state.ebook,
    lastCfi: state => state.lastCfi,
  },
  mutations: {
    'SET_EBOOK': (state, ebook) => {
      state.ebook = ebook;
    },
    'SET_LASTCFI': (state, lastCfi) => {
      state.lastCfi = lastCfi;
    }
  },
  actions: {
    setEbook: ({ commit }, ebook) => commit('SET_EBOOK', ebook),

    async getLastCFI({ commit, state, dispatch }) {
      let lastRead = await database.getLastReadFromDB(state.ebook.ebookID);

      if (lastRead) {
        commit('SET_LASTCFI', lastRead.lastCfi);
        return lastRead.lastCfi;
      } else {
        await dispatch('setLastRead', 0);
        return 0;
      }
    },

    async setLastRead({ commit, state }, lastCfi) {
      commit('SET_LASTCFI', lastCfi);
      let lastRead = {}
      lastRead.ebookID = state.ebook.ebookID;
      lastRead.date = new Date().toISOString();
      lastRead.lastCfi = lastCfi;

      await database.updateLastReadToDB(lastRead);
    },
  },
  modules: {
    setting,
  }
})
