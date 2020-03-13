<template>
  <div class="home">
    <el-container>

      <eve-sidebar
        :toc = "toc"
        @openFile = "openFile"
        @handleNodeClick = "handleNodeClick"
      />

      <el-container>
        <el-main>
          <div id="eve-reader-view"></div>
        </el-main>
      </el-container>

    </el-container>
  </div>
</template>

<script>
// @ is an alias to /src
import Epub from 'epubjs'
import EveSidebar from '@/components/EveSidebar';

global.epub = Epub

export default {
  name: 'home',

  components: {
    EveSidebar,
  },

  data() {
    return {
      isReady: true,
      toc: [],
    }
  },

  mounted() {
    this.initBook();
  },

  methods: {
    initBook() {
      this.book = new Epub();
    },
    
    openFile() {
      var fi = document.createElement("input");
      fi.setAttribute("accept", "application/epub+zip");
      fi.style.display = "none";
      fi.type = "file";
      fi.onchange = () => {
        var reader = new FileReader();
        reader.onload = () => {
          this.openEpub(reader.result);
        }
        if (fi.files[0]) {
          reader.readAsArrayBuffer(fi.files[0]);
          let fileName = fi.files[0].name;
          this.$router.push(fileName)
        }
      };
      document.body.appendChild(fi);
      fi.click();
    },

    openEpub(data) {
      this.book.destroy();
      this.initBook();
      this.book.open(data, "binary");
      this.rendition = this.book.renderTo("eve-reader-view", {
        manager: "continuous",
        flow: "scrolled",
        axis: "vertical",
        width: "100%",
        height: "100%",
        // snap: true,
        fullsize: true,
      });
      this.rendition.display();

      // Pick up Toc
      this.book.loaded.navigation.then((nav) => {
        // change "subitems" to "children", because element-ui Tree
        this.toc = JSON.parse((JSON.stringify(nav.toc)).replace(/"subitems"/g, '"children"'));
      });
    },

    handleNodeClick(item) {
      this.rendition.display(item.href);
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
