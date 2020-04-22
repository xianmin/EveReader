<template>
  <div class="eve-calibre-home">
    <el-table
      :data="bookList"
      stripe
      border
      fit
      style="width: 100%">
      <el-table-column
        type="index">
      </el-table-column>
      <el-table-column
        prop="title"
        label="Title"
        width="300">
      </el-table-column>
      <el-table-column
        prop="timestamp"
        label="Date"
        width="700">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'home',

  components: {
  },

  data() {
    return {
      bookList: [],
    }
  },

  beforeCreate() {
    // at github page, jump to reader directly
    if (process.env.NODE_ENV === "production"){
      this.$router.push("/reader");
    }
  },

  created() {
    this.init();
  },

  methods: {
    async init() {
      this.bookList = await this.$api.getBookList();
    },
  },

  mounted() {
  }
}
</script>

<style lang="scss" scoped>
</style>
