<template>
  <el-container>
    <el-header height="10vh" v-show="this.prevNav">
      <div class="view-prev" @click="doPrev">
        ▲ Prev Section
      </div>
    </el-header>
    <el-main>
      <div id="eve-reader-view"></div>
    </el-main>
    <el-footer height="10vh" v-show="this.nextNav">
      <div class="view-next" @click="doNext">
        ▼ Next Section
      </div>
    </el-footer>
  </el-container>
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
      rendition: null,
      prevNav: "",
      nextNav: "",
    }
  },

  mounted() {
    this.rendition = this.ebook.rendition = this.ebook.epub.renderTo("eve-reader-view", {
      // manager: "continuous",
      flow: "scrolled-doc",
      axis: "vertical",
      width: "100%",
      height: "100%",
      // snap: true,
      fullsize: true,
    });

    this.rendition.themes.fontSize(`${this.ebook.defaultFontsize}px`);
    this.rendition.display();

    this.rendition.on("rendered", (section) => {
      let prevSection = section.prev();
      let nextSection = section.next();

      // TODO: get section name
      if (prevSection) {
        this.prevNav = prevSection.href;
      } else {
        this.prevNav = "";
      }

      if (nextSection) {
        this.nextNav = nextSection.href;
      } else {
        this.nextNav = "";
      }
    });
  },

  methods: {
    doPrev() {
      this.rendition.prev();
    },
    
    doNext() {
      this.rendition.next();
    },
  },
};
</script>

<style lang="scss" scoped>
#eve-reader-view {
  max-width: 800px;
  margin: auto;
}

.el-main {
  min-height: 90vh;
  padding: 0 0 10vh 0;
}

.el-header, .el-footer {
  padding: 0;
  // line-height: 60px;

  .view-prev, .view-next {
    cursor: pointer;
    // background-color: #B3C0D1;
    font-size: 20px;
    color: #333;
    text-align: center;
    width: 100%;
    height: 100%;
    line-height: 10vh;
  }

  .view-prev {
    border-bottom: 1px solid #ececec;
  }

  .view-next {
    border-top: 1px solid #ececec;
  }
}

</style>
