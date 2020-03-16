<template>
  <div class="home">
    <el-container>

      <eve-sidebar/>

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
import Ebook from '@/ebook'
import EveSidebar from '@/components/EveSidebar';

export default {
  name: 'home',

  components: {
    EveSidebar,
  },

  mounted() {
    this.ebook = new Ebook("eve-reader-view");
    this.$store.dispatch("setEbook", this.ebook);
  },

  methods: {
  },
}
</script>

<style lang="scss" scoped>
#eve-reader-view {
  max-width: 800px;
  margin: auto;
}
</style>
