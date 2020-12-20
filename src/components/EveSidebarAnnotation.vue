<template>
  <div id="sidebar-annotation">
    <div class="sidebar-header">
      <div class="sidebar-header-text"> Annotation</div>
      <div class="sidebar-empty-fix" style="flex-grow: 1"></div>
      <div class="sidebar-header-icon annotation-header-more" 
        @click="showAnnotationMore = !showAnnotationMore"
        v-clickoutside="hideAnnotationMore">
        <i class="el-icon-more"></i>
        <div class="annotation-header-more-items" v-show="showAnnotationMore">
          <div class="annotation-header-more-item">
            <label>
              Import
              <input type="file" @change="importAnnotation">
            </label>
          </div>
          <div class="annotation-header-more-item" @click="exportAnnotation">Export</div>
        </div>
      </div>
    </div>
    <div class="sidebar-main">
      <div class="eve-annotation-card"
        v-for="item in allAnnotation" :key="item.hash"
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
import Clickoutside from 'element-ui/src/utils/clickoutside';

export default {
  computed: {
    ...mapGetters('annotation', [
      'annotationList',
    ]),
  },

  directives: { Clickoutside },

  data() {
    return {
      allAnnotation: null,
      showAnnotationMore: false,
    }
  },

  watch: {
    annotationList(newVal) {
      this.setAllAnnotation(newVal);
    }
  },

  methods: {
    hideAnnotationMore() {
      this.showAnnotationMore = false;
    },

    importAnnotation(ev) {
      const file = ev.target.files[0];
      const reader = new FileReader();

      // TODO: electron not work here, but web is work.
      reader.onload = e => {
        this.$store.dispatch('annotation/importAnnotation', e.target.result).then((result) => {
          switch(result) {
            case 'success':
              this.$message({
                message: 'Import Success!',
                type: 'success'
              });
              break;
            case 'error':
              this.$message({
                message: 'Import Failed!',
                type: 'error'
              });
          }
        })
      };

      reader.readAsText(file);
      this.hideAnnotationMore();
    },

    exportAnnotation() {
      this.$store.dispatch('annotation/exportAnnotation');
    },

    setAllAnnotation(arrData) {
      this.allAnnotation = this.annotationList.slice(); // clone array
      this.sortAnnotation();
    },

    sortAnnotation(sortMethod = 'sortByDate') {
      switch(sortMethod) {
        case 'sortByDate':
          this.allAnnotation.sort((a,b) => new Date(b.date) - new Date(a.date));
          break;
      }
    },

    displayFromAnnotation(cfiRange) {
      this.$bus.emit('event-view-display', cfiRange);
    },

    formatDate(dateString) {
      let date = new Date(dateString);
      let y = date.getFullYear();
      let m = date.getMonth() + 1;
      m = m < 10 ? '0' + m : m;
      let d = date.getDate();
      d = d < 10 ? ('0' + d) : d;
      return y + '-' + m + '-' + d;
    },
  },

  mounted() {
    this.setAllAnnotation(this.annotationList);
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

.annotation-header-more {
  position: relative;
  padding-right: 10px;

  .annotation-header-more-items {
    position: absolute;
    right: 0;
    border: 1px solid #ebeef5;

    .annotation-header-more-item {
      background-color: white;
      padding: 5px 10px;

      label {
        cursor: pointer;

        input {
          display: none;
        }
      }
    }

    .annotation-header-more-item:hover {
      background-color: #ecf5ff;
      color: #66b1ff;
    }
  }
}
</style>
