<template>
    <nav class="navbar bg-dark">
        <div class="container-fluid">
        <!-- Left Section: Brand and Form -->
        <div class="d-flex align-items-center">
            <a class="navbar-brand text-success link-success me-3" href="/">Eventitude</a>
            <form class="d-flex">
            <input class="form-control me-2 border-success" type="search" placeholder="Search">
            <button class="btn btn-success" type="submit">Search</button>
            </form>
        </div>

        <!-- Right Section: Buttons -->
        <div>
            <router-link v-if="!token" to="/Login" class="btn btn-outline-success me-2">Login</router-link>
            <li v-else class="d-inline">
            <router-link to="/CreateEvent" class="btn btn-outline-success me-2">Create Event</router-link>          
            <button @click="logOut" class="btn btn-outline-danger me-2">Log Out</button>
            </li>
        </div>
        </div>
    </nav>
</template>

<script>
    import { logOutUser } from '@/Services/service';

    export default {
    computed: { token() { return localStorage.getItem('session_token');}  },
    methods: {
        async logOut() 
        {
            try 
            {
                localStorage.removeItem('currentUser_id');
                await logOutUser();
                localStorage.removeItem('session_token');
                
                this.LoggedIn = false;  
                this.$router.push("/"); 
                window.location.reload();

            } 
            catch (err) 
            { 
                if(err.message.includes("401")) alert("Unauthorised please refresh the page and try again");
                else alert("Error logging out. Please try again.");  
            }
        }
    }
    }
</script>