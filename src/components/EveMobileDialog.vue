<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    :modal-append-to-body="false"
    width="100%"
    top="0"
  >
    <dialog-annotation v-show="dialogVisible && dialogName === 'annotation'" />
    <dialog-toc v-show="dialogVisible && dialogName === 'toc'" />
    <dialog-setting v-show="dialogVisible && dialogName === 'setting'" />
  </el-dialog>
</template>

<script>
import DialogAnnotation from "./dialog/DialogAnnotation.vue";
import DialogSetting from "./dialog/DialogSetting.vue";
import DialogToc from "./dialog/DialogToc.vue";

export default {
  components: { DialogSetting, DialogToc, DialogAnnotation },
  data() {
    return {
      dialogName: "",
      dialogTitle: "",
      dialogVisible: false,
    };
  },

  watch: {
    dialogName(newVal) {
      switch (newVal) {
        case "setting":
          this.dialogTitle = "Setting";
          break;
        case "toc":
          this.dialogTitle = "Table Of Content";
          break;
        case "annotation":
          this.dialogTitle = "Annotation";
      }
    },
  },

  methods: {
    openDialog(dialogName) {
      this.dialogName = dialogName;
      this.dialogVisible = true;
    },
  },
};
</script>

<style lang="scss" scoped></style>
