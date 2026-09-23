<template>
    <NavBar/>    

    <div class="login-container vh-100 d-flex justify-content-center align-items-center">
        <div class="login-box p-4 rounded bg-secondary">
            <h2 class="text-center">Login</h2>
            
            <form @submit.prevent="loginUser">
                <div class="mb-3">
                    <label for="email" class="form-label">Email address</label>
                    <input type="email" class="form-control" id="email" v-model="email" required />
                </div>
        
                <div class="mb-4">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" v-model="password" required />
                </div>
        
                <div class="d-flex justify-content-between align-items-center">
                    <button type="submit" class="btn btn-success">Login</button>
                    <router-link to="/SignUp" class="text-light">Don't have an account? Sign up</router-link>
                </div>
            </form>

        </div>
    </div>
</template>
  
<script>
    import { loginUser } from '@/Services/service';
    import NavBar from '@/Views/Components/NavBar.vue'

    export default 
    {
        data() 
        {
            return {
            email: "",
            password: "",
            };
        },
        methods: 
        {
            async loginUser()
            {
                // Email Validation
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(this.email)) 
                {
                    alert("Please enter a valid email address.");
                    return;
                }

                // Password Validation
                const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
                if (!passwordPattern.test(this.password)) 
                {
                    alert("Password must be 8-20 characters long and include at least one lowercase letter, one uppercase letter, and one number.");
                    return;
                }
                // Login user request
                try
                {
                    const userData ={
                        email: this.email,
                        password: this.password
                    }

                    const data = await loginUser(userData);

                    localStorage.setItem('session_token', data.session_token);
                    localStorage.setItem('currentUser_id',data.user_id);
                    this.$router.push("/"); 
                }
                catch(err) {   alert("Error login in user, Try writing your email and password again"); }
            }            
        },
        components:{
        NavBar
        }
}
</script>
  
<style scoped>
  .login-container {    background-color: #858383; }  
  .login-box {  width: 100%;    max-width: 400px;   }  
</style>
  