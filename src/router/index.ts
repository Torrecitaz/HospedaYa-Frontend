import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/property/:id',
      name: 'propertyDetail',
      component: () => import('../views/PropertyDetailView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/client/dashboard',
      name: 'clientDashboard',
      component: () => import('../views/ClientDashboard.vue')
    },
    {
      path: '/host/dashboard',
      name: 'hostDashboard',
      component: () => import('../views/HostDashboard.vue')
    },
    {
      path: '/admin/dashboard',
      name: 'adminDashboard',
      component: () => import('../views/AdminDashboard.vue')
    }
  ]
})

export default router
