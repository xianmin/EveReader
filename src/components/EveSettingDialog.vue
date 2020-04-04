<template>
  <el-dialog
    title="Setting"
    :visible.sync="settingVisible"
    width="35%">

    <el-form :model="setting">
      <el-form-item label="FontSize">
        <el-input v-model="setting.fontSize"></el-input>
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
      // send to EveViewer.vue
      Event.updateSetting(this.setting);
      this.ebook.updateGeneralSetting(this.setting);
      this.settingVisible = false;
    },
  },
}
</script>

<style>

</style>
