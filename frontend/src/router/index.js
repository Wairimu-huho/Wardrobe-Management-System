// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import ClothingItems from '../views/ClothingItems.vue';
import ClothingItemDetail from '../views/ClothingItemDetail.vue';
import ClothingItemForm from '../views/ClothingItemForm.vue';
import Categories from '../views/Categories.vue';
import CategoryDetail from '../views/CategoryDetail.vue';


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
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { 
    path: '/dashboard', 
    component: Dashboard,
    beforeEnter: requireAuth
  },
  {
    path: '/items',
    component: ClothingItems,
    beforeEnter: requireAuth
  },
  {
    path: '/items/new',
    component: ClothingItemForm,
    beforeEnter: requireAuth
  },
  {
    path: '/items/:id',
    component: ClothingItemDetail,
    beforeEnter: requireAuth
  },
  {
    path: '/items/:id/edit',
    component: ClothingItemForm,
    beforeEnter: requireAuth
  },
  {
    path: '/categories',
    component: Categories,
    beforeEnter: requireAuth
  },
  {
    path: '/categories/:id',
    component: CategoryDetail,
    beforeEnter: requireAuth
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;