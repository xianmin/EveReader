import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ebook: null,
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
  }
})
