import { createApp } from 'vue'
import { reactive  } from 'vue'
import App from './App.vue'
import router from "./Router/index.js"


import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

export const store = reactive({
    token: localStorage.getItem('session_token') || null,
  });

createApp(App).use(router).mount('#app')
