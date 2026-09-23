import { createRouter , createWebHistory } from 'vue-router'

import Home from "@/Views/Pages/Home.vue"
import Login from '@/Views/Pages/Login.vue'
import SignUp from '@/Views/Pages/SignUp.vue'
import CreateEvent from '@/Views/Pages/CreateEvent.vue'
import UpdateEvent from '@/Views/Pages/UpdateEvent.vue'
import SingleEvent from '@/Views/Components/SingleEvent.vue'

const ifAuthenticated = (to, from, next) =>{
    const loggedIn = localStorage.getItem('session_token');
    if(loggedIn)    next() 
    else next('Login')
}

const routes =[

    {path: "/" , component:Home},
    {path: "/Login" , component:Login},
    {path: "/SignUp" , component:SignUp},
    {path: "/CreateEvent" , component:CreateEvent, beforeEnter: ifAuthenticated},
    {path: "/UpdateEvent" , component:UpdateEvent, beforeEnter: ifAuthenticated},
    {path: "/SingleEvent" , component:SingleEvent}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})
export default router