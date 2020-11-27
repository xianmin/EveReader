import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ebook: null,
    currentSectionIndex: 6,
  },
  getters: {
    ebook: state => state.ebook,
    currentSectionIndex: state => state.currentSectionIndex,
  },
  mutations: {
    'SET_EBOOK': (state, ebook) => {
      state.ebook = ebook;
    },
    'SET_CURRENT_SECTION_INDEX': (state, currentSectionIndex) => {
      state.currentSectionIndex = currentSectionIndex;
    },
  },
  actions: {
    setEbook: ({ commit }, ebook) => commit('SET_EBOOK', ebook),
    setCurrentSectionIndex: ({ commit }, currentSectionIndex) => {
      commit('SET_CURRENT_SECTION_INDEX', currentSectionIndex);
    }
  },
  modules: {
  }
})
