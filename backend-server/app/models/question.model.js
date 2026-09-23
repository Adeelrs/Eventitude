// const { func } = require("joi");
const db = require("../../database.js");

const add_question = (event_id,user_id,question,done) =>
{
    // Check to see if you are a creator 
    const check_creator_sql = "SELECT * FROM events WHERE event_id = ?";
    db.get(check_creator_sql, [event_id], (err, row) => 
    {
        //if there is an error then err will send a value that will be picked up by the controller
        //you cant ask questions at your own event so send false for athorising the question
        if (err||row.creator_id == user_id) return done(err,false,null);

        const check_registration_sql = "SELECT * FROM attendees WHERE event_id = ? AND user_id = ?";
        db.get(check_registration_sql, [event_id,user_id], (err, attendees_row) => 
        {
            //if there is an error then err will send a value that will be picked up by the controller
            //check if there are any attendees if not then no1 is registered so no1 should be able to ask a question
            if (err || !attendees_row) return done(err,false,null);

            const sql = "INSERT INTO questions (question, asked_by, event_id, votes) VALUES (?,?,?,?)";
            db.run(sql,[question, user_id,event_id, 0],function(err){   return done(err, true ,this.lastID )    })
        })
    })
}

const delete_question = (question_id, user_id, done) => 
{
    //Check if the question exists
    const sql = "SELECT * FROM questions WHERE question_id = ?";
    db.get(sql,[question_id],(err, row) =>
    {
        if(err || !row) return done(err,false,false);
        let author = row.asked_by;

        const check_creator_sql = "SELECT * FROM events WHERE event_id = ?";
        db.get(check_creator_sql, [row.event_id], (err, row) => 
        {
            // check if there is an event and if the creator of the event is the user logged in 
            // OR if the author is the user logged in
            if (err || !(row && (row.creator_id === user_id || author === user_id))) return done(err,true,false);
            
            const delete_question_sql = "DELETE FROM questions WHERE question_id = ?"
            db.run(delete_question_sql,[question_id],function(err)
            { 
                return done(err, true, true) 
            })
        })
    })
}

const authorise_vote = (question_id,voter_id,done) =>
{
    const find_question_sql = "SELECT * FROM questions WHERE question_id = ?"
    db.get(find_question_sql,[question_id],(err,row) =>
    {
        //check if there is a question to vote on
        if(err || !row) return done(err,false,false);
        
        const find_vote_sql = "SELECT * FROM votes WHERE voter_id = ? AND question_id = ?"
        db.get(find_vote_sql, [voter_id, question_id], (err,row) =>
        {
            //if the user hasnt already voted pass the authorisation
            if(!row) return done(err,true,true);
            else return done(err,true,false);
        })
    })
}

const up_vote_question = (question_id,voter_id,done) =>
{
    const vote_sql = "INSERT INTO votes (question_id, voter_id) VALUES (?,?)";
    db.run(vote_sql,[question_id, voter_id],function(err)
    {
        if (err) { return done(err);   }
        
        const increase_count_sql = "UPDATE questions SET votes = IFNULL(votes , 0) + 1 WHERE question_id = ?";
        db.run(increase_count_sql,[question_id],function(err) { done(err) })
    })
}

const down_vote_question = (question_id, voter_id, done) =>
{
    const vote_sql = "INSERT INTO votes (question_id, voter_id) VALUES (?,?)";
    db.run(vote_sql,[question_id, voter_id],function(err)
    {
        if (err) { return done(err);   }

        const decrease_count_sql = "UPDATE questions SET votes = IFNULL(votes , 0) - 1 WHERE question_id = ?";
        db.run(decrease_count_sql,[question_id],function(err) { done(err) })
    })
}

module.exports = 
{
    add_question,
    delete_question,
    authorise_vote,
    up_vote_question,
    down_vote_question
}