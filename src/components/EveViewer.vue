<template>
<div>
  <div id="eve-reader-container">
    <div id="open-file" @click="openFile">open</div>
    <!-- <a id="prev" href="#prev" class="navlink">...</a> -->
    <div id="eve-reader-view"></div>
    <!-- <a id="next" href="#next" class="navlink">...</a> -->
  </div>
</div>
</template>

<script>
import Epub from 'epubjs';

export default {
  methods: {
    initViewer() {
      this.book = new Epub();
    },

    openFile() {
     // this.book = Epub();
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
        height: 600,
        // snap: true,
        fullsize: true,
      });
      this.rendition.display("epubcfi(/6/14[id122]!/4/20/1:145)");
    }
  },

  mounted() {
    this.initViewer();
  },
};
</script>

<style scoped>
#eve-reader-container {
  margin: 60px 0;
}

#eve-reader-view {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}
</style>
