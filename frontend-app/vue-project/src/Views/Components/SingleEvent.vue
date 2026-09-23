<template>
    <div class="row justify-content-center">
      <div v-for="(event, index) in filteredEvents" :key="index" class="card p-1 m-4" style="width: 18rem; height: 16rem;">
        <div  class="card-body">
          <h5 class="card-title">{{ event.name }}</h5>
          <p class="card-text">{{ truncatedDescription(event.description) }}</p>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#eventModal" @click="setActiveEvent(event,index)">View Details</button>
        </div>
      </div>
    </div>
  
    <!-- Modal for Event Details -->
    <div class="modal fade" id="eventModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          
            <!-- Header Display -->
            <div class="modal-header">
                <h5 class="modal-title">{{ eventData.name }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
  
            <!-- Display Event Details -->
            <div class="modal-body">
                <p><strong>Creator:</strong> {{ eventData.creator.first_name }} {{ eventData.creator.last_name }}</p>
                <p><strong>Email:</strong> {{ eventData.creator.email }}</p>
                <p><strong>Description:</strong> {{ eventData.description }}</p>
                <p><strong>Location:</strong> {{ eventData.location }}</p>
                <p><strong>Start Date:</strong> {{ formatDate(eventData.start) }}</p>
                <p><strong>Close Registration:</strong> {{ formatDate(eventData.close_registration) }}</p>
                <p><strong>Number Attending: </strong>{{ eventData.number_attending }} / {{ eventData.max_attendees }}</p>
    
                <!-- Display Attendees -->
                <div v-if="isCreator(eventData.creator.creator_id)">
                    <hr />
                    <h5>Attendees:</h5>
                    <ul>
                        <li v-for="attendee in eventData.attendees" :key="attendee.user_id">
                        {{ attendee.first_name }} {{ attendee.last_name }} ({{ attendee.email }})
                        </li>
                    </ul>
                </div>

  
                <!-- Display Questions -->
                <hr />
                <h5>Questions:</h5>
                <div class="mb-3 d-flex align-items-center">
                    <input type="text" v-model="newQuestion" placeholder="Type your question..." class="form-control me-2"/>
                    <button class="btn btn-primary" @click="askQuestion">Submit</button>
                </div>                    
                <div v-if="eventData.questions.length">
                    <div v-for="question in eventData.questions" :key="question.question_id" class="card mb-3" style="border: 1px solid #ddd; ">
                        <div class="card-body">
                            <p><strong>{{ question.asked_by.first_name }} asked:</strong> {{ question.question }}</p>
                            <p><strong>Votes:</strong> {{ question.votes }}</p>
                            <div class="d-flex">
                                <button class="btn btn-success btn-sm me-2" @click="upvoteQuestion(question.question_id)">Upvote</button>
                                <button class="btn btn-warning btn-sm me-2" @click="downvoteQuestion(question.question_id,question.votes)">Downvote</button>
                                <button v-if="isCreator(eventData.creator.creator_id) || isAuthor(question.asked_by.user_id)" class="btn btn-danger btn-sm" @click="deleteQuestion(question.question_id)">Delete Question</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
  
            <div class="modal-footer d-flex justify-content-between">
                <div>
                    <button @click="RegisterEvent" type="button" class="btn btn-primary m-1">Attend</button>
                    <button v-if="isCreator(eventData.creator.creator_id)" @click="UpdateEvent" class="btn btn-secondary ">Edit details</button>
                </div>
                <div>
                    <button v-if="isCreator(eventData.creator.creator_id)" @click="DeleteEvent" class="btn btn-danger m-1">Delete event</button>
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
      </div>
    </div>
</template>
  
  
<script>
    import {  getEvent, askQuestion, registerEvent ,upVoteQuestion ,downVoteQuestion ,deleteEvent ,deleteQuestion ,updateEvent} from "@/Services/service";
    export default 
    {
        data() 
        {
            return {
                event_id: 0,
                listData: [], // Array to store the 20 events
                eventData: 
                {
                    creator: 
                    {
                    creator_id: 0,
                    first_name: "",
                    last_name: "",
                    email: "",
                    },
                    name: "",
                    description: "",
                    location: "",
                    start: "",
                    close_registration: "",
                    max_attendees: 0,
                    number_attending: 0,
                    attendees: [],
                    questions: [],
                    newQuestion: ""
                },
                currentUserId: localStorage.getItem("currentUser_id") || -1
            }
        },
        computed: { filteredEvents() {  return this.listData.filter(event => event.close_registration !== -1);  } },
        mounted() {   this.fetchEventList();   },
        methods: 
        {
            async fetchEventList() 
            {
                try 
                {
                    for (let i = 1; i <= 20; i++) 
                    {
                    const data = await getEvent(i);
                    this.listData.push(data);
                    }
                } 
                catch (err) { if (!err.message.includes("404")) alert("Failed to fetch event details. Please try again.");}
            },

            async fetchAndUpdateEvent() 
            {
                try 
                {
                    const updatedEvent = await getEvent(this.eventData.event_id);
                    const eventIndex = this.listData.findIndex(event => event.event_id === updatedEvent.event_id);
                    if (eventIndex !== -1) {    this.listData.splice(eventIndex, 1, updatedEvent);  } 
                    else { this.listData.push(updatedEvent); }
                    this.eventData = updatedEvent;
                } catch (err) { alert("Failed to update event details. Please try again.");}
            }
            ,

            async UpdateEvent()
            {
                const data ={

                }
                try
                {
                    await updateEvent(this.eventData.event_id,data);
                    await this.fetchAndUpdateEvent();
                }
                catch(err)
                {
                    if(err.message.includes("401"))alert("Unauthorised");
                    if(err.message.includes("403"))alert("You can only update your own events");
                    if(err.message.includes("404"))alert("Event not found");
                    if(err.message)alert(err.message);
                    else alert("Error updating event details");
                }
            },

            async RegisterEvent(){

                try
                { 
                    await registerEvent(this.eventData.event_id);
                    await this.fetchAndUpdateEvent();
                }
                catch(err)
                { 
                    if(err.message.includes("401"))alert("You cant register if you are not logged in or if you are the event creator!");
                    else if(err.message.includes("404"))alert("Event not found");
                    else if(err.message.includes("403"))alert("Unauthorised");
                    else alert("Error registering to event");             
                }
            },

            async DeleteEvent(){
                try
                { 
                    await deleteEvent(this.eventData.event_id);
                    await this.fetchAndUpdateEvent();
                    window.location.reload();
                }
                catch(err)
                {
                    if(err.message.includes("401"))alert("Unauthorised");
                    else if(err.message.includes("403"))alert("You can only delete your own events");
                    else if(err.message.includes("404"))alert("Event not found");
                    else alert("Error deleting event");
                }
            },

            async askQuestion() 
            {
                if (!this.newQuestion || this.newQuestion.trim() === "") 
                {
                    alert("Please enter a question before submitting.");
                    return;
                }

                try 
                {
                    const question = {
                        question: this.newQuestion,
                    };
                    await askQuestion(this.eventData.event_id, question);
                    await this.fetchAndUpdateEvent();
                    this.newQuestion = ""; 
                } 
                catch (err) 
                { 
                    if(err.message.includes("400"))alert("Bad input data");
                    else if(err.message.includes("401"))alert("You need to be logged in to be able to ask a question ");
                    else if(err.message.includes("403"))alert("You cannot ask questions on events you are not registered for or your own events");
                    else alert("Error asking question");  
                }
            },

            async deleteQuestion(questionId) 
            {
                try
                {
                    await deleteQuestion(questionId);
                    await this.fetchAndUpdateEvent();
                }
                catch(err)
                {
                    if(err.message.includes("401"))alert("Unauthorised");
                    else if(err.message.includes("403"))alert("You can only delete questions that have authored, or for events that you have created");
                    else if(err.message.includes("404"))alert("Question not found");
                    else alert("Error deleting question");
                }
            },
            async upvoteQuestion(questionId) 
            {
                try
                { 
                    await upVoteQuestion(questionId);
                    await this.fetchAndUpdateEvent();            
                }
                catch(err)
                { 
                    if(err.message.includes("401"))alert("You need to be logged in to vote");
                    else if(err.message.includes("403"))alert("You have already voted on this question");
                    else if(err.message.includes("404"))alert("Question not found");
                    else alert("Error up voting"); 
                }
            },
            async downvoteQuestion(questionId) 
            {
                try
                { 
                    await downVoteQuestion(questionId);
                    await this.fetchAndUpdateEvent();
                }
                catch(err)
                { 
                    if(err.message.includes("401"))alert("You need to be logged in to vote");
                    else if(err.message.includes("403"))alert("You have already voted on this question");
                    else if(err.message.includes("404"))alert("Question not found");
                    else alert("Error up voting"); 
                }
            },
            

            isAuthor(author)        
            {   
                if(author == this.currentUserId) return true
                else return false;
            },
            isCreator(creator_id)   
            {   
                if(creator_id == this.currentUserId) return true
                else return false;
            },
            setActiveEvent(event,index)
            {    
                this.eventData = event; 
                this.event_id = index;
            },

            truncatedDescription(description = "") 
            {
            const maxLength = 150;
            if(description.length > maxLength) return description.slice(0, maxLength) + "..."
            else return description
            },

            formatDate(timestamp) 
            {
            if (!timestamp) return "N/A";
            const date = new Date(timestamp);
            return date.toLocaleString();
            }
        }
    };
</script>
  