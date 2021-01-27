<template>
  <el-dialog
    title="Setting"
    :visible.sync="settingVisible"
    :modal-append-to-body="false"
    width="35%"
  >
    <dialog-setting v-if="settingVisible" />
  </el-dialog>
</template>

<script>
import DialogSetting from "./dialog/DialogSetting.vue";

export default {
  components: { DialogSetting },

  data() {
    return {
      settingVisible: false,
    };
  },

  methods: {
    openSettingDialog() {
      this.settingVisible = true;
    },
  },
};
</script>

<style></style>
