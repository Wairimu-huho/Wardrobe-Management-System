// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './stores';

const app = createApp(App);

// Order matters - add router before mounting
app.use(router);
app.use(pinia);

app.mount('#app');