<template>
  <el-dialog
    title="Setting"
    :visible.sync="settingVisible"
    :modal-append-to-body=false
    width="35%">
    <div class="setting-container">

      <div class="setting-item-name">Font Size</div>
      <div class="setting-item-input">
        <el-input v-model="fontSize">
          <template slot="append">px</template>
        </el-input>
      </div>

      <div class="setting-item-name">Line Height</div>
      <div class="setting-item-input">
        <el-input v-model="lineHeight"></el-input>
      </div>

      <div class="setting-item-name">Page Width</div>
      <div class="setting-item-input">
        <el-input v-model="pageWidth">
          <template slot="append">px</template>
        </el-input>
      </div>

      <div class="setting-item-name">Background Color</div>
      <div class="setting-item-input">
        <el-input v-model="backgroundColor"></el-input>
      </div>

    </div>
  </el-dialog>
</template>

<script>
export default {
  computed: {
  },

  data() {
    return {
      settingVisible: false,
      fontSize: 18,
      lineHeight: 1.8,
      pageWidth: 900,
      backgroundColor: '#FFFFFF',
    }
  },

  mounted() {
    this.updateSetting();
  },

  watch: {
    settingVisible() {
      // when dialog close, maybe data is illegal value, reset.
      this.updateSetting();
    },

    fontSize(newVal) {
      if (newVal > 14 && newVal < 40) {
        this.$store.dispatch('setting/setEbookSetting', { fontSize: newVal });
      }
    },

    lineHeight(newVal) {
      if (newVal > 1 && newVal < 3) {
        this.$store.dispatch('setting/setEbookSetting', { lineHeight: newVal });
      }
    },

    pageWidth(newVal) {
      if (newVal > 300) {
        this.$store.dispatch('setting/setEbookSetting', { pageWidth: newVal });
      }
    },

    backgroundColor() {
    }
  },

  methods: {
    updateSetting() {
      this.fontSize = this.$store.state.setting.fontSize;
      this.lineHeight = this.$store.state.setting.lineHeight;
      this.pageWidth = this.$store.state.setting.pageWidth;
      this.backgroundColor = this.$store.state.setting.backgroundColor;
    },

    openSettingDialog() {
      this.settingVisible = true;
    },

    // saveSetting() {
    //   // validate setting value first
    //   this.$refs.settingForm.validate((valid) => {
    //     if (valid) {
    //       // this.ebook.updateUserSetting(this.setting);
    //       this.$store.commit('SET_SETTING', this.setting);
    //       this.settingVisible = false;
    //       this.$message({
    //         message: 'Setting Save Success!',
    //         type: 'success'
    //       });
    //     } else {
    //       this.$message({
    //         message: 'Setting Save Failed!',
    //         type: 'error'
    //       });
    //       return false;
    //     }
    //   })
    // },
  },
}
</script>

<style lang="scss">
.setting-container {
  display: grid;
  grid-template-columns: 35% 65%;
  align-items: center;
  grid-row-gap: 20px;
  // grid-template-areas: 'item-name item-input';

    .setting-item-name {
      font-size: 18px;
      // grid-area: item-name;
    }

    .setting-item-input {
      // grid-area: item-input;
    }
}

</style>
