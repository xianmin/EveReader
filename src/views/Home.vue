<template>
  <div class="home">
    <el-container>

      <eve-sidebar/>

      <router-view v-if='this.ebook.epub.isOpen'>
        <eve-viewer></eve-viewer>
      </router-view>

    </el-container>
  </div>
</template>

<script>
// @ is an alias to /src
import Ebook from '@/ebook'
import EveSidebar from '@/components/EveSidebar';
import EveViewer from '@/components/EveViewer';

export default {
  name: 'home',

  components: {
    EveSidebar,
    EveViewer,
  },

  created() {
    this.ebook = new Ebook();
    this.$store.dispatch("setEbook", this.ebook);
  },

  methods: {
  },
}
</script>

<style lang="scss" scoped>
</style>
