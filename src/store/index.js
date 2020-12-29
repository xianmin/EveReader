import Vue from "vue";
import Vuex from "vuex";
import setting from "./setting";
import annotation from "./annotation";
import database from "../database";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    ebook: null,
    ebookRootNode: null,
    ebookViewReady: false,
    lastCfi: 0,
    currentSectionIndex: null,
  },
  getters: {
    ebook: (state) => state.ebook,
    ebookRootNode: (state) => state.ebookRootNode,
    ebookViewReady: (state) => state.ebookViewReady,
    lastCfi: (state) => state.lastCfi,
    currentSectionIndex: (state) => state.currentSectionIndex,
  },
  mutations: {
    SET_EBOOK: (state, ebook) => {
      state.ebook = ebook;
    },
    SET_EBOOK_ROOT_NODE: (state, ebookRootNode) => {
      state.ebookRootNode = ebookRootNode;
    },
    SET_EBOOK_VIEW_READY: (state, ebookViewReady) => {
      state.ebookViewReady = ebookViewReady;
    },
    SET_LASTCFI: (state, lastCfi) => {
      state.lastCfi = lastCfi;
    },
    SET_CURRENT_SECTION_INDEX: (state, currentSectionIndex) => {
      state.currentSectionIndex = currentSectionIndex;
    },
  },
  actions: {
    setEbook: ({ commit }, ebook) => commit("SET_EBOOK", ebook),

    async refreshEbookViewReady({ commit }) {
      await commit("SET_EBOOK_VIEW_READY", false);
      await commit("SET_EBOOK_VIEW_READY", true);
    },

    async getLastCFI({ commit, state, dispatch }) {
      let lastRead = await database.getLastReadFromDB(state.ebook.ebookID);

      if (lastRead) {
        commit("SET_LASTCFI", lastRead.lastCfi);
        return lastRead.lastCfi;
      } else {
        await dispatch("setLastRead", 0);
        return 0;
      }
    },

    async setLastRead({ commit, state }, lastCfi) {
      commit("SET_LASTCFI", lastCfi);
      let lastRead = {};
      lastRead.ebookID = state.ebook.ebookID;
      lastRead.date = new Date().toISOString();
      lastRead.lastCfi = lastCfi;

      await database.updateLastReadToDB(lastRead);
    },
  },
  modules: {
    setting,
    annotation,
  },
});
