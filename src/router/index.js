import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import EveViewer from '../components/EveViewer.vue';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    redirect: () => {
      // at github page, jump to 'reader' directly.
      if (process.env.NODE_ENV === 'production') return '/reader/'
    },
  },
  {
    path: '/reader/',
    name: 'Reader',
    component: () => import('../views/Reader.vue'),
    children: [
      {
        path: '/reader/open/:fileName',
        name: 'open',
        component: EveViewer,
      },
      {
        path: '/reader/view/:book_id',
        name: 'view',
        component: EveViewer,
      }
    ]
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
