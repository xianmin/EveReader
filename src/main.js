import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import api from './api';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

// reset style
import './assets/style/reset.scss';
import './assets/style/global.scss';

Vue.prototype.$api = api;

Vue.config.productionTip = false
Vue.use(ElementUI);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
