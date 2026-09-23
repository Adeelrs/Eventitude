const event_model = require("../models/event.model");
const user_model  = require("../models/user.model");
const Joi = require('joi');

//POST event (AUTHENTICATED)  
// Creates an event with the data passed in the request body
const create_new_event = (req,res) =>
{
    const schema = Joi.object
    ({
        name: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        start: Joi.number().integer().required(),
        close_registration: Joi.number().integer().min(1).required(),
        max_attendees: Joi.number().integer().min(1).required()
    })

    const { error } = schema.validate(req.body);
    if (error) { return res.status(400).send({error_message: error.details[0].message })} // checks that the user input is in the right format
         
    let date = Date.now();
    if(req.body.start <= date)  {   return res.status(400).send({ error_message: "Event start time must be in the future."})    }
    if(req.body.start <= req.body.close_registration)   {   return res.status(400).send({ error_message: "Registration must close before the event start time. "})  }    

    //gets the user id using the token that should be in the request header 
    user_model.get_ID_from_token(req.headers["x-authorization"], (err,id) =>    
    {
        if(err) return res.Status(500).send({message: "Invalid token"})
        if(!id) return res.Status(404).send({message: "User not found"});
        
        //adds the event data that is passed in the event body as well as checks if the user is the creator with the id
        event_model.add_new_event(req.body, id, (err, id) => 
        {
            if (err) {  return res.sendStatus(500); }
            return res.status(201).send({ event_id: id });             
        })
    })

    
}

//GET event     
// returns the event details requested at the event id in the request parameter
const get_single_event = (req,res) =>
{       
    // gets a single events details  using the token in 
    user_model.get_ID_from_token(req.headers["x-authorization"], (err,id) =>
    {
        if (err) return res.sendStatus(500); 
        //gets the event details and returns the result
        event_model.get_event_details(req.params.event_id, id, (err,result) =>
        {
            if(err) return res.sendStatus(err);
            if(!result) return res.sendStatus(404);
            return res.status(200).send(result);
        })       
    })
}

//PATCH event (AUTHENTICATED)   
//Updates the details of an event that is passed in the request body
const update_event = (req,res) =>
{
    const schema = Joi.object
    ({
        name: Joi.string(),
        description: Joi.string(),
        location: Joi.string(),
        start: Joi.number().integer().min(1),
        close_registration: Joi.number().integer().min(1),
        max_attendees: Joi.number().integer().min(1)
    }).min(1);

    const { error } = schema.validate(req.body);
    if (error) { return res.status(400).send({error_message: error.details[0].message })} // checks if the input is in the right format
    
    let date = Date.now();
    if(req.body.start && (req.body.start <= date))  {   return res.status(400).send({ error_message: "Event start time must be in the future."})    }
    if(req.body.start && req.body.close_registration && (req.body.start <= req.body.close_registration))   {   return res.status(400).send({ error_message: "Registration must close before the event start time. "})  }    

    let event_id = req.params.event_id;
    let token = req.headers["x-authorization"]

    //before updating an event we need to check if there even is an event that we want to update
    event_model.check_event_exists(event_id,(err, event_found)=>
    {
        if(err) return res.sendStatus(500);
        if(event_found == false){ return res.sendStatus(404);}
        //once the event's existance is varified we get the user id to check for events that this user created
        user_model.get_ID_from_token(token, (err,id) =>
        {
            if(err) return res.sendStatus(500);
            if(!id) return res.sendStatus(404);
            //updates the events data in the database
            event_model.update_event(event_id,id,req.body,(err, row_found, authorised) => 
            {   
                if(err) return res.sendStatus(500);
                if(!row_found) {   return res.sendStatus(404);     }
                if(!authorised) {   return res.sendStatus(403);     }
                
                // the code bellow just checks what values were not said to change 
                const schema_missing = Joi.object
                ({
                    name: Joi.string().required(),
                    description: Joi.string().required(),
                    location: Joi.string().required(),
                    start: Joi.number().integer().min(1).required(),
                    close_registration: Joi.number().integer().min(1).required(),
                    max_attendees: Joi.number().integer().min(1).required()
                })
            
                const { error : missing } = schema_missing.validate(req.body);
                if (missing) { return res.status(200).send({error_message: missing.details[0].message })}
                else return res.sendStatus(200);

            })
        })         
    })       
}

//GET event (AUTHENTICATED) DONE
const register_event = (req,res) =>
{
    // first get the user id from the token that should be passed which acts as authentication too but is used to get the user id
    const event_id = req.params.event_id;
    user_model.get_ID_from_token(req.headers["x-authorization"], (err,user_id) =>
    {
        if(err) return res.sendStatus(500);
        if(!user_id) return res.sendStatus(404);

        //add the user to the database 
        event_model.register_event(event_id, user_id, ( err, event_found, message) =>
        {
            if(message) return res.status(403).send(message);
            if(event_found == false) return res.sendStatus(404);

            if(err) return res.sendStatus(500);
            return res.sendStatus(200);
        })
    })
}

//PATCH event (AUTHENTICATED)   
const delete_event = (req,res) =>
{
    const event_id = req.params.event_id;
    const token = req.headers["x-authorization"]
    const value = { "close_registration": -1 }

    user_model.get_ID_from_token(token, (err, user_id) =>
    {
        if (err) return res.sendStatus(500); 
        if(!user_id) return res.sendStatus(404); 

        event_model.update_event(event_id, user_id, value, (err, row_found, authorised)=>
        {
            if(err) return res.sendStatus(500); 
            if(!row_found) return res.sendStatus(404);  
            if(!authorised) return res.sendStatus(403); 

            return res.sendStatus(200);
        })
    })    
}

//Incomplete search function
const search = (req,res) =>
{
return res.sendStatus(500);
}

module.exports = 
{
    create_new_event,
    get_single_event,
    update_event,
    register_event,
    delete_event,
    search

}

