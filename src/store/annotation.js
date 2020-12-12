/* eslint-disable no-unused-vars */
import database from '../database';

export default {
  namespaced: true,

  state: {
    annotationList: [],
  },

  getters: {
    annotationList: state => state.annotationList,
  },

  mutations: {
    'SET_ANNOTATION_LIST': (state, annotationList) => {
      state.annotationList = annotationList;
    },

    'ADD_ANNOTATION': (state, annotation) => {
      state.annotationList.push(annotation)
    },

    'DELETE_ANNOTATION': () => {},
  },

  actions: {
    async initAnnotation({ commit, state, rootState }) {
      await database.getEveAnnotationDB(rootState.ebook.ebookID);
      let annotationList = await database.getAllAnnotation();
      commit('SET_ANNOTATION_LIST', annotationList);
    },

    async addAnnotation({ commit, state, rootState }, annotation) {
      commit('ADD_ANNOTATION', annotation);
      console.log(annotation);
      await database.addAnnotationToDB(rootState.ebook.ebookID, annotation);
    },
  },
}
