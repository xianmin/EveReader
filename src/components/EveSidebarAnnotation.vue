<template>
  <div id="sidebar-annotation">
    <div class="sidebar-header">
      <div class="sidebar-header-text"> Annotation</div>
    </div>
    <div class="sidebar-main">
      <div class="eve-annotation-card"
        v-for="item in allAnnotations" :key="item.hash"
        @click = "displayFromAnnotation(item.cfiRange)">
        <div class="eve-annotation-header">
          <div class="eve-annotation-date"> {{ formatDate(item.date) }} </div>
          <div class="eve-annotation-more">
            <i class="el-icon-more"></i>
          </div>
        </div>
        <div class="eve-annotation-text"> {{ item.text }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters([
      'ebook',
    ]),
  },

  data() {
    return {
      allAnnotations: null,
    }
  },

  props: {
    data: {
      type: Array,
    },
  },

  watch: {
    data(newVal) {
      this.setAllAnnotations(newVal);
    }
  },

  methods: {
    setAllAnnotations(newVal) {
      this.allAnnotations = newVal;
    },

    displayFromAnnotation(cfiRange) {
      this.ebook.rendition.display(cfiRange);
    },

    formatDate(date) {
      let y = date.getFullYear();
      let m = date.getMonth() + 1;
      m = m < 10 ? '0' + m : m;
      let d = date.getDate();
      d = d < 10 ? ('0' + d) : d;
      return y + '-' + m + '-' + d;
    },
  },

  created() {
    this.setAllAnnotations(this.data);
  },
}
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
