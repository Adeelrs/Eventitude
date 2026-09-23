<template>
  <NavBar />  
  <div class="create-event-container d-flex justify-content-center align-items-start">
    <div class="create-event-box d-flex flex-column rounded bg-secondary">
      <h1 class="p-2">Events</h1>
      <div class="row justify-content-center">
        <SingleEvent/>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/Views/Components/NavBar.vue';
import SingleEvent from '@/Views/Components/SingleEvent.vue';

export default {
  components: {
    NavBar,
    SingleEvent,
  },
};
</script>

<style>
.create-event-container {
  background-color: #858f87;
  min-height: calc(100vh - 56px); 
  height: 1rem;
}

.create-event-box {
  width: 100%;
  min-height: 100%;
  padding: 1rem;
}
</style>
