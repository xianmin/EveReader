/* eslint-disable no-unused-vars */
import database from "../database";

export default {
  namespaced: true,

  state: {
    annotationList: [],
  },

  getters: {
    annotationList: (state) => state.annotationList,
    getBySectionIndex: (state, getters, rootState) => {
      let index = rootState.currentSectionIndex;
      return state.annotationList.filter((annotation) => {
        return annotation.sectionIndex === index;
      });
    },
  },

  mutations: {
    SET_ANNOTATION_LIST: (state, annotationList) => {
      state.annotationList = annotationList;
    },

    ADD_ANNOTATION: (state, annotation) => {
      state.annotationList.push(annotation);
    },

    DELETE_ANNOTATION: (state, hash) => {
      let index = state.annotationList.findIndex(
        (annotation) => annotation.hash === hash
      );
      state.annotationList.splice(index, 1);
    },
  },

  actions: {
    async initAnnotation({ commit, state, rootState }) {
      await database.getEveAnnotationDB(rootState.ebook.ebookID);
      let annotationList = await database.getAllAnnotation();
      commit("SET_ANNOTATION_LIST", annotationList);
    },

    async addAnnotation({ commit, state, rootState }, annotation) {
      commit("ADD_ANNOTATION", annotation);
      await database.addAnnotationToDB(rootState.ebook.ebookID, annotation);
    },

    async deleteAnnotation({ commit, state, rootState }, hash) {
      commit("DELETE_ANNOTATION", hash);
      await database.deleteAnnotationFromDB(rootState.ebook.ebookID, hash);
    },

    async importAnnotation({ dispatch, rootState }, data) {
      const json = JSON.parse(data);
      const ebookID = json.ebookID;
      const annotationList = json.annotation;

      if (rootState.ebook.ebookID === ebookID) {
        for (let i = 0; i < annotationList.length; i++) {
          await database.addAnnotationToDB(ebookID, annotationList[i]);
        }
        await dispatch("initAnnotation");
        return "success";
      } else {
        return "error";
      }
    },

    exportAnnotation({ state, rootState }) {
      let json = {};
      json.title = rootState.ebook.title;
      json.annotation = state.annotationList;
      json.ebookID = rootState.ebook.ebookID;

      const blob = new Blob([JSON.stringify(json)], {
        type: "application/json",
      });
      const uri = URL.createObjectURL(blob);

      const element = document.createElement("a");
      element.href = uri;
      element.download = `${json.title} - annotation.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    },
  },
};
