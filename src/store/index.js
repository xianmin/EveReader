import Vue from 'vue'
import Vuex from 'vuex'
import setting from './setting';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ebook: null,
  },
  getters: {
    ebook: state => state.ebook,
  },
  mutations: {
    'SET_EBOOK': (state, ebook) => {
      state.ebook = ebook;
    },
  },
  actions: {
    setEbook: ({ commit }, ebook) => commit('SET_EBOOK', ebook),
  },
  modules: {
    setting,
  }
})
