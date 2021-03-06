<template>
  <div class="home">
    <eve-sidebar class="eve-sidebar" />

    <router-view v-if="this.ebook.epub.isOpen" class="home-container">
      <eve-viewer></eve-viewer>
    </router-view>

    <div
      class="home-container"
      v-if="this.$route.path === '/reader/' && !isElectron"
    >
      <div class="home-wrapper">
        <div class="home-title">EvE Reader</div>
        <div class="home-open">
          <div class="drop-zone">
            <div class="hover-text">DROP<br />HERE</div>
          </div>
          <div style="font-size: 6rem">OR</div>
          <div class="home-icon-open" @click="openFile">
            <img svg-inline src="@/assets/svg/openfile.svg" />
            Open File
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Ebook from "@/ebook";
import EveSidebar from "@/components/EveSidebar";
import EveViewer from "@/components/EveViewer";

export default {
  name: "reader",

  components: {
    EveSidebar,
    EveViewer,
  },

  data() {
    return {
      isElectron: true,
    };
  },

  async created() {
    this.ebook = new Ebook();
    this.$store.dispatch("setEbook", this.ebook);
    this.$store.dispatch("setting/initSetting");

    if (this.$route.name === "view") {
      let book_id = this.$route.params.book_id;
      let api = process.env.VUE_APP_API;
      let url = `${api}/show/${book_id}/epub/file.epub`;
      this.ebook.openEpubFromUrl(url);
    }

    // electron environment, listen for file open from argv
    if (window.ipcRenderer) {
      window.ipcRenderer.on("IPC::FILE-OPEN", (event, data, fileName) => {
        this.ebook.openEpub(data).then(() => {
          this.ebook.fileName = fileName;
          this.redirectRouter();
        });
      });
    } else {
      this.isElectron = false;
    }

    this.$bus.on("bus-open-file", this.openFile);
  },

  beforeDestroy() {
    this.$bus.off("bus-open-file");
  },

  methods: {
    openFile() {
      if (window.ipcRenderer) {
        window.ipcRenderer.send("IPC::ASK-OPEN-FILE");
      } else {
        this.ebook.openFile().then(() => {
          this.redirectRouter();
        });
      }
    },

    openFileFromDrop(file) {
      this.ebook.openFileFromDrop(file).then(() => {
        this.redirectRouter();
      });
    },

    redirectRouter() {
      this.$router.push(`/reader/open/${Math.random()}`);
    },
  },

  mounted() {
    if (!window.File) {
      throw new Error("Eve Reader are not supported by this browser!");
    }

    // Drag and Drop Event
    // -----------------------------------------------------------
    // Bug: by default, Drop epub to window always open the file.
    // but, opened epub is "iframe", if drop to iframe area, event doesn't work.
    let dropzone = document.querySelector(".drop-zone");

    function onDragOver(e) {
      if (e.dataTransfer.types.indexOf("Files") == -1) return;
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      dropzone.classList.add("drop-zone-hover");
    }

    function onDragEnter(e) {
      if (e.dataTransfer.types.indexOf("Files") == -1) return;
      dropzone.classList.add("drop-zone-hover");
    }

    function onDragleave(e) {
      if (e.dataTransfer.types.indexOf("Files") == -1) return;
      dropzone.classList.remove("drop-zone-hover");
    }

    function onDragDrop(e) {
      e.stopPropagation();
      e.preventDefault();
      dropzone.classList.remove("drop-zone-hover");

      let fileList = e.target.files || e.dataTransfer.files;

      if (fileList.length == 0) return;

      let file = fileList[0]; // always choose the first file
      this.openFileFromDrop(file);
    }

    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragend", onDragleave);
    window.addEventListener("dragleave", onDragleave);
    window.addEventListener("drop", onDragDrop.bind(this));
    // End Drag and Drop Event
    // -------------------------------------------------------------
  },
};
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: row;
}

.eve-sidebar {
  flex-shrink: 0;
}

.home-container {
  margin: 0 auto;

  .home-wrapper {
    // width: 60vw;
    .home-title {
      font-size: 10rem;
      font-weight: bold;
      text-align: center;
    }

    .home-open {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 10vh;
    }

    .drop-zone {
      height: 50vh;
      width: 30vw;
      border: 4px dashed #aaa;
      border-radius: 10px;
      transition: 0.3s;
      margin-right: 5vw;

      .hover-text {
        padding-top: 10vh;
        color: #aaa;
        font-size: 6rem;
        text-align: center;
        transition: 0.3s;
      }

      &.drop-zone-hover {
        border-color: #4286f4;

        .hover-text {
          color: #4286f4;
        }
      }
    }

    .home-icon-open {
      cursor: pointer;
      font-size: 3rem;
      width: 30vw;
      height: 50vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #aaa;

      svg {
        width: 10vw;
        fill: #aaa;
      }

      &:hover {
        color: #4286f4;

        svg {
          fill: #4286f4;
        }
      }
    }
  }
}

.eve-sidebar {
  z-index: 1;
}
</style>
