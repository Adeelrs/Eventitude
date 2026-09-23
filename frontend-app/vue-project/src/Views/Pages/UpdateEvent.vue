<template>
    <NavBar/>    

    <div class="create-event-container d-flex justify-content-center">
      <div class="create-event-box p-4 rounded bg-secondary">
        
        <h2 class="text-center">Create Event</h2>
        
        <form @submit.prevent="updateEvent">
          <!-- Event Name -->
          <div class="mb-3">
            <label for="name" class="form-label">Event Name</label>
            <input type="text" class="form-control" id="name" v-model="name" required />
          </div>
  
          <!-- Description -->
          <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea class="form-control" id="description" v-model="description" rows="3" required></textarea>
          </div>
  
          <!-- Location -->
          <div class="mb-3">
            <label for="location" class="form-label">Location</label>
            <input type="text" class="form-control" id="location" v-model="location" required />
          </div>
  
          <!-- Start Date -->
          <div class="mb-3">
            <label for="start" class="form-label">Start Date and Time</label>
            <input type="datetime-local" class="form-control" id="start" v-model="start" required />
          </div>
  
          <!-- Close Registration Date -->
          <div class="mb-3">
            <label for="close_registration" class="form-label">Close Registration</label>
            <input type="datetime-local" class="form-control" id="close_registration" v-model="close_registration" required />
          </div>
  
          <!-- Maximum Attendees -->
          <div class="mb-3">
            <label for="max_attendees" class="form-label">Maximum Attendees</label>
            <input type="number" class="form-control" id="max_attendees" v-model.number="max_attendees" required />
          </div>
  
          <!-- Submit Button -->
          <button type="submit" class="btn btn-success w-100">Create Event</button>
        </form>
      </div>
    </div>
  </template>
  
<script>
    import { createEvent } from "@/Services/service";
    import NavBar from '@/Views/Components/NavBar.vue';

  
  export default {
    data() {
      return {
        eventData: {
          name: "",
          description: "",
          location: "",
          start: "",
          close_registration: "",
          max_attendees: 0,
        },
      };
    },
    methods: {
      async createEvent() {
        try {
          const eventDetails = {
            name: this.name,
            description: this.description,
            location: this.location,
            start: new Date(this.eventData.start).getTime(),
            close_registration: new Date(this.eventData.close_registration).getTime(),
            max_attendees: this.max_attendees,
          };
  
          await createEvent(eventDetails);
          alert("Event created successfully!");
          this.$router.push("/");
        } catch (err) { alert("Failed to create event. Please try again.");}
      },
    },
    components: 
    {
      NavBar
    }
  }


  </script>
  
  <style scoped>
  .create-event-container {
    background-color: #858383;
    padding-top: 1rem; 
    padding-bottom: 1rem; 
  }
  
  .create-event-box {
    width: 100%;
    max-width: 50rem;
  }
  </style>
  