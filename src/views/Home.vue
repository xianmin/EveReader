<template>
  <div class="home">
    <eve-viewer v-if='isReady'></eve-viewer>
  </div>
</template>

<script>
// @ is an alias to /src
import Epub from 'epubjs'
import EveViewer from '@/components/EveViewer';

global.epub = Epub

export default {
  name: 'home',

  components: {
    EveViewer,
  },

  data() {
    return {
      isReady: true,
    }
  },

  mounted() {
  }
}
</script>
