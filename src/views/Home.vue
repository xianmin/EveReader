<template>
  <div class="home">
    <el-container>

      <el-aside>
        <div id="activitybar">
          <div class="activitybar-icon" @click="openFile">
            <img svg-inline src="@/assets/svg/openfile.svg"/>
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
    },
  },
}
</script>

<style lang="scss" scoped>
#activitybar {
  width: 60px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #2c2c2c;
  top: 0px;
  bottom: 0px;
  left: 0px;
  position: fixed;

  .activitybar-icon {
    width: 40px;
    height: 40px;
    padding: 10px;
    fill: #AAAAAA;
    cursor: pointer;

    &:hover {
      fill: #FFFFFF;
    }

    &.active {
      fill: #FFFFFF;
    }

    svg {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
