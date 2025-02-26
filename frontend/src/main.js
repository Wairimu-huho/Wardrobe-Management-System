// src/main.js
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import router from './router';
import pinia from './stores';

const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount('#app');