<template>
    <NavBar/>    

    <div class="signup-container vh-100 d-flex justify-content-center align-items-center">
      <div class="signup-box p-4 rounded bg-secondary">
        <h2 class="text-center mb-4">Sign Up</h2>
        
        <form @submit.prevent="createUser">
          <!-- Name Input -->
          <div class="mb-3">
            <label for="name" class="form-label">First Name</label>
            <input type="text" class="form-control" id="name" v-model="name" required />
          </div>

          <!-- Last Name Input -->
          <div class="mb-3">
            <label for="name" class="form-label">Last Name</label>
            <input type="text" class="form-control" id="name" v-model="lastName" required />
          </div>
  
          <!-- Email Input -->
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input type="email" class="form-control" id="email" v-model="email" required />
          </div>
  
          <!-- Password Input -->
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" v-model="password" required />
          </div>
  
          <!-- Sign Up Button and Link to Login -->
          <div class="d-flex justify-content-between align-items-center">
            <button type="submit" class="btn btn-success">Sign Up</button>
            <router-link to="/Login" class="text-light">Already have an account? Login</router-link>
          </div>
        </form>
  
      </div>
    </div>
</template>
  
<script>
  import { createUser } from '@/Services/service';
  import NavBar from '@/Views/Components/NavBar.vue';



  export default 
  {
    data() 
    {
      return {
      name: "",
      lastName: "",
      email: "",
      password: "",
      }
    },
    methods: 
    {
      async createUser()
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
          alert("Password must be 8-20 characters long and include at least one lowercase and uppercase letter as well as a number and special character."); 
          return;
        }

        // Create user request
        try
        {
          const userData =
          {
            first_name: this.name,
            last_name: this.lastName,
            email: this.email,
            password: this.password
          }
          await createUser(userData);          
          this.$router.push("/login");
        }
        catch(err) 
        {   
            if (err.message) {  alert(err.message);  } 
            else {  alert("Error creating a user"); }
        }
      }
    },
    components:{
      NavBar
    }
  }
</script>
  
<style scoped>
  .signup-container { background-color: #858383; }
  .signup-box { width: 100%;  max-width: 400px; }    
</style>
  