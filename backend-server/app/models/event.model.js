const db = require("../../database.js");

// CREATE EVENT
// 1. add a new event with the details passed from the body
// 2. use the register function to sign up the creator to its event as you create the event
const add_new_event = (event,user_ID, done) => 
{
    const sql = "INSERT INTO events (name, description,location,start_date,close_registration,max_attendees, creator_id ) VALUES (?,?,?,?,?,?,?)";
    const values = [event.name, event.description, event.location, event.start, event.close_registration, event.max_attendees ,user_ID];

    db.run(sql, values, function(err) 
    {
        if (err) { return done(err);   }

        register_event(this.lastID, user_ID, (err, event_found, message) => 
        {
            return done(err, this.lastID);
        })
    })
}


// GET EVENT DETAIL (single event detail)
const get_event_details = (event_id, user_id, done) => 
{
    let attendees = [];
    let questions = [];


    const sql = 'SELECT events.* FROM events WHERE events.event_id = ?';

    db.get(sql, event_id, (err, event_row) => 
    {
        if (err||!event_row) return done(err , null);

        const sql_get_creator = 'SELECT users.first_name, users.last_name, users.email FROM users WHERE users.user_id = ?';
        db.get(sql_get_creator,event_row.creator_id,(err,user_row)=>
        {
            if (err||!user_row) return done(err , null);

            const questionsSql = `
            SELECT questions.question_id, questions.question, questions.votes, questions.asked_by, users.user_id, users.first_name 
            FROM questions
            JOIN users ON questions.asked_by = users.user_id
            WHERE questions.event_id = ?
            ORDER BY questions.question_id DESC`;


            db.each(questionsSql, [event_id], (err,question) => 
            { 
                questions.push
                ({
                    "question_id": question.question_id,
                    "question": question.question,
                    "votes": question.votes,
                    "asked_by": 
                    {
                        "user_id": question.user_id,
                        "first_name": question.first_name
                    }
                })
            },         
            (err) => 
            {  
                if(err) {   return done( err, null )    }   
                
                const attendeesSql = `
                SELECT users.user_id, users.first_name, users.last_name, users.email 
                FROM attendees
                JOIN users ON attendees.user_id = users.user_id
                WHERE attendees.event_id = ?`;
                
                db.each(attendeesSql, [event_id], (err,attendee) => 
                {
                    attendees.push(
                    {
                        "user_id": attendee.user_id,
                        "first_name": attendee.first_name,
                        "last_name": attendee.last_name,
                        "email": attendee.email
                    })
                }, 
                (err,numRows) => 
                { 
                    if(err) {   return done(err,null)   }
                    let return_event_details = {
                        "event_id": event_row.event_id,
                        "creator": {
                            "creator_id": event_row.creator_id,
                            "first_name": user_row.first_name,
                            "last_name": user_row.last_name,
                            "email": user_row.email
                        },
                        "name": event_row.name,
                        "description": event_row.description,
                        "location": event_row.location,
                        "start": event_row.start_date,
                        "close_registration": event_row.close_registration,
                        "max_attendees": event_row.max_attendees,
                        "number_attending": numRows            
                    }

                    if (user_id == event_row.creator_id)  return done(err, {  ...return_event_details,attendees, questions   })    
                    else return done(err, {  ...return_event_details, questions  })
                })
            })
        })
    })
}

const update_event = (event_id,user_id,update,done)=>
{
    const sql_authenticate_creator = "SELECT * FROM events WHERE event_id = ?";
    db.get(sql_authenticate_creator,[event_id],(err,row)=>
    {
        if(err || !row) return done(err,false,false);

        if(row.creator_id === user_id) 
        {
            const sql = "UPDATE events SET name = COALESCE(?, name), description = COALESCE(?, description), location = COALESCE(?, location), start_date = COALESCE(?, start_date), close_registration = COALESCE(?, close_registration), max_attendees = COALESCE(?, max_attendees) WHERE event_id = ? AND creator_id = ?";
            const values = [update.name, update.description, update.location, update.start_date, update.close_registration, update.max_attendees, event_id, user_id]; 
        
            db.run(sql,values, function(err)
            {
                if (err) return done(err,false,false);  
                return done(err,true,true); 
            })
        }
        else return done(err,true,false)
    })   
}

const check_event_exists = (event_id, done) => {
    const sql = "SELECT event_id FROM events WHERE event_id = ?";

    db.get(sql, [event_id], (err,row)=> 
    {
        if (err)  {  return done(err);   }
        if (!row) {  return done(null, false);   }
        return done(null,true); 
    });
}

const register_event = (event_id, user_id, done) => 
{
    // Check if the user is already registered for the event
    const check_registration_sql = "SELECT * FROM attendees WHERE event_id = ? AND user_id = ?";
    db.get(check_registration_sql, [event_id, user_id], (err, row) => 
    {
        if (err) return done(err,null,null);
        if (row) return done(null,true,{ error_message: "You are already registered" });

        // Check if the registration is closed
        const check_event_sql = "SELECT * FROM events WHERE event_id = ?";
        db.get(check_event_sql, [event_id], (err, event) => 
        {
            //if there is an err or if there is no event send err if there is one and false for event found without an error message
            if (err||!event) return done(err,false,null); 

            // check if event registration is closed
            if (event.close_registration < Date.now()) {    return done(err,true,{ error_message: "Registration is closed" });  }

            // Check if the event is at its capacity
            const check_capacity_sql = "SELECT COUNT(*) as count FROM attendees WHERE event_id = ?";
            db.get(check_capacity_sql, [event_id], (err, result) =>
            {
                if (err) return done(err,true,null);
                if (result.count >= event.max_attendees) {  return done(null,true,{ error_message: "Event is at capacity" });    }

                // Register the user for the event
                const sql = "INSERT INTO attendees (event_id, user_id) VALUES (?, ?)";
                db.run(sql, [event_id, user_id], function (err) 
                {
                    return done(err,null,null);
                })
            })
        })
    })
}




module.exports = 
{
    add_new_event,
    get_event_details,
    update_event,
    check_event_exists,
    register_event    
}