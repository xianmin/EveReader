<template>
  <el-dialog
    title="Setting"
    :visible.sync="settingVisible"
    width="35%">

    <el-form :model="setting" :rules="rules" ref="settingForm" label-position="right">
      <el-form-item label="FontSize" prop="fontSize" label-width="40%" >
        <el-input v-model.number="setting.fontSize"></el-input>
      </el-form-item>
      <el-form-item label="Line Height" prop="lineHeight" label-width="40%" >
        <el-input v-model="setting.lineHeight"></el-input>
      </el-form-item>
      <el-form-item label="Page Width" prop="pageWidth" label-width="40%" >
        <el-input v-model="setting.pageWidth"></el-input>
      </el-form-item>
      <el-form-item label="Background Color" prop="backgroundColor" label-width="40%" >
        <el-input v-model="setting.backgroundColor"></el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="settingVisible = false">Cancel</el-button>
      <el-button type="primary" @click="saveSetting">Save</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { Event } from '../event.js';

export default {
  computed: {
    ...mapGetters([
      'ebook',
    ]),
  },

  data() {
    return {
      settingVisible: false,
      setting: {},
      rules: {
        fontSize: [
          { type: 'number', message: 'FontSize must be number!', trigger: 'blur'},
        ]
      },
    }
  },

  mounted() {
    this.ebook.ready.then(() => {
      this.setting = this.ebook.generalSetting
    })
  },

  methods: {
    openSettingDialog() {
      this.settingVisible = true;
    },

    saveSetting() {
      // validate setting value first
      this.$refs.settingForm.validate((valid) => {
        if (valid) {
          // send to EveViewer.vue
          Event.updateSetting(this.setting);
          this.ebook.updateGeneralSetting(this.setting);
          this.settingVisible = false;
          this.$message({
            message: 'Setting Save Success!',
            type: 'success'
          });
        } else {
          this.$message({
            message: 'Setting Save Failed!',
            type: 'error'
          });
          return false;
        }
      })
    },
  },
}
</script>

<style>

</style>
