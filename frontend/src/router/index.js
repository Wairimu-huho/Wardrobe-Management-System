import { createRouter, createWebHistory } from 'vue-router';

// Auth views
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

// Main views
import Dashboard from '../views/Dashboard.vue';
import ClothingItems from '../views/ClothingItems.vue';
import ClothingItemDetail from '../views/ClothingItemDetail.vue';
import Categories from '../views/Categories.vue';

// Auth guard
const requireAuth = (to, from, next) => {
  const token = localStorage.getItem('token');
  if (!token) {
    next('/login');
  } else {
    next();
  }
};

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    beforeEnter: requireAuth
  },
  {
    path: '/items',
    name: 'ClothingItems',
    component: ClothingItems,
    beforeEnter: requireAuth
  },
  {
    path: '/items/:id',
    name: 'ClothingItemDetail',
    component: ClothingItemDetail,
    beforeEnter: requireAuth
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories,
    beforeEnter: requireAuth
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;