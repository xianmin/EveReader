<template>
  <div class="eve-calibre-home">
    <el-table
      :data="bookList"
      stripe
      border
      fit
      :default-sort = "{prop: 'last_modified', order: 'descending'}"
      style="width: 100%">
      <el-table-column
        type="index"
        align="center">
      </el-table-column>
      <el-table-column
        prop="title"
        label="Title">
      </el-table-column>
      <el-table-column
        prop="last_modified"
        label="Last modified"
        sortable
        align="center"
        width="150%">
      </el-table-column>
      <el-table-column 
        label="Read"
        align="center"
        width="120%">
        <template slot-scope="scope">
          <el-button
            size="normal"
            @click="doRead(scope.row)">READ</el-button>
        </template>
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
      this.$router.push("/reader/");
    }
  },

  created() {
    this.init();
  },

  methods: {
    async init() {
      this.bookList = await this.$api.getBookList();
    },

    doRead(row) {
      let path = `/reader/view/${row.book_id}`;
      let route = this.$router.resolve(path);
      // open ebook in the new window
      window.open(route.href, '_blank');
    },
  },

  mounted() {
  }
}
</script>

<style lang="scss" scoped>
.eve-calibre-home{
  width: 900px;
  margin: 0 auto;
}
</style>
