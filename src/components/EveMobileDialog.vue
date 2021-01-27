<template>
  <el-dialog
    title="Setting"
    :visible.sync="dialogVisible"
    :modal-append-to-body="false"
    width="100%"
    top="0"
  >
    <dialog-setting v-if="dialogVisible" />
  </el-dialog>
</template>

<script>
import DialogSetting from "./dialog/DialogSetting.vue";
export default {
  components: { DialogSetting },
  data() {
    return {
      dialogVisible: false,
    };
  },

  methods: {
    openDialog() {
      this.dialogVisible = true;
    },
  },
};
</script>

<style lang="scss" scoped></style>
