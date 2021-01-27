<template>
  <div>
    <div
      class="eve-annotation-card"
      v-for="item in allAnnotation"
      :key="item.hash"
      @click="displayFromAnnotation(item.cfiRange)"
    >
      <div class="eve-annotation-header">
        <div class="eve-annotation-date">{{ formatDate(item.date) }}</div>
        <div class="eve-annotation-more">
          <i class="el-icon-more"></i>
        </div>
      </div>
      <div class="eve-annotation-text">{{ item.text }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters("annotation", ["annotationList"]),
  },

  data() {
    return {
      allAnnotation: null,
    };
  },

  mounted() {
    this.setAllAnnotation(this.annotationList);
  },

  watch: {
    annotationList(newVal) {
      this.setAllAnnotation(newVal);
    },
  },

  methods: {
    displayFromAnnotation(cfiRange) {
      this.$bus.emit("event-view-display", cfiRange);
    },

    formatDate(dateString) {
      let date = new Date(dateString);
      let y = date.getFullYear();
      let m = date.getMonth() + 1;
      m = m < 10 ? "0" + m : m;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      return y + "-" + m + "-" + d;
    },

    setAllAnnotation() {
      this.allAnnotation = this.annotationList.slice(); // clone array
      this.sortAnnotation();
    },

    sortAnnotation(sortMethod = "sortByDate") {
      switch (sortMethod) {
        case "sortByDate":
          this.allAnnotation.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          break;
      }
    },
  },
};
</script>

<style lang="scss">
.eve-annotation-card {
  background: white;
  margin: 5px;
  padding: 5px;
  font-size: 14px;
  cursor: pointer;

  .eve-annotation-header {
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    padding: 0 5px;

    .el-icon-more {
      font-size: 18px;
      cursor: pointer;
    }
  }
}
</style>
