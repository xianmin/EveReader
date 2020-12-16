/* eslint-disable no-unused-vars */
import database from '../database';

export default {
  namespaced: true,

  state: {
    annotationList: [],
  },

  getters: {
    annotationList: state => state.annotationList,
    getBySectionIndex: (state, getters, rootState) => {
      let index = rootState.currentSectionIndex
      return state.annotationList.filter(annotation => {
        return annotation.sectionIndex === index;
      });
    }
  },

  mutations: {
    'SET_ANNOTATION_LIST': (state, annotationList) => {
      state.annotationList = annotationList;
    },

    'ADD_ANNOTATION': (state, annotation) => {
      state.annotationList.push(annotation)
    },

    'DELETE_ANNOTATION': (state, hash) => {
      let index = state.annotationList.findIndex(annotation => annotation.hash === hash);
      state.annotationList.splice(index, 1);
    },
  },

  actions: {
    async initAnnotation({ commit, state, rootState }) {
      await database.getEveAnnotationDB(rootState.ebook.ebookID);
      let annotationList = await database.getAllAnnotation();
      commit('SET_ANNOTATION_LIST', annotationList);
    },

    async addAnnotation({ commit, state, rootState }, annotation) {
      commit('ADD_ANNOTATION', annotation);
      await database.addAnnotationToDB(rootState.ebook.ebookID, annotation);
    },

    async deleteAnnotation({ commit, state, rootState }, hash) {
      commit('DELETE_ANNOTATION', hash);
      await database.deleteAnnotationFromDB(rootState.ebook.ebookID, hash);
    }
  },
}
