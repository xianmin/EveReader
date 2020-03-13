<template>
  <div class="home">
    <el-container>

      <el-aside>
        <div id="activitybar">
          <div class="sidebar-icon" @click="openFile">
            open
          </div>
        </div>
      </el-aside>

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

global.epub = Epub

export default {
  name: 'home',

  components: {
  },

  data() {
    return {
      isReady: true,
    }
  },

  mounted() {
    this.initViewer();
  },

  methods: {
    initViewer() {
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
          console.log(this.book);
          this.openEpub(reader.result);
        }
        if (fi.files[0]) {
            reader.readAsArrayBuffer(fi.files[0]);
        }
      };
      document.body.appendChild(fi);
      fi.click();
    },

    openEpub(data) {
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
      this.rendition.display("epubcfi(/6/14[id122]!/4/20/1:145)");
    },
  },
}
</script>

<style scoped>
#activitybar {
  width: 60px;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* background-color: #2c2c2c; */
  top: 0px;
  bottom: 0px;
  left: 0px;
  position: fixed;
}
</style>
