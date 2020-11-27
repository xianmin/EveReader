<template>
  <div v-html="html" ref="viewSection"></div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters([
      'ebook',
    ]),
  },

  props: ['section', 'sectionIndex'],

  data() {
    return {
      html: "",
      io: null,
      loaded: false,
    }
  },

  async created() {
    let request = this.ebook.epub.load.bind(this.ebook.epub);
    await this.section.render(request).then((result) => {
      this.html = result;
    })

  },

  mounted() {
    // this.ebook.epub.load("/text/part0010.html").then((result) => {
    //   this.html = result.documentElement.innerHTML;
    // })

    // this.ebook.epub.load(this.section.canonical).then((result) => {
    //   this.html = result.documentElement.innerHTML
    // })
  },
}
</script>

<style>

</style>
