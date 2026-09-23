const Joi = require('joi');
const question_model = require("../models/question.model");
const user_model  = require("../models/user.model");


const ask_question = (req,res) =>
{
    const schema = Joi.object({     question: Joi.string().required()   });
    const { error } = schema.validate(req.body);
    if( error ) return res.status(400).json({ error_message: error.details[0].message });

    user_model.get_ID_from_token(req.headers["x-authorization"], (err,user_id) =>
    {
        if(err) return res.sendStatus(500);
        if(!user_id) return res.sendStatus(401); 
        
        question_model.add_question(req.params.event_id, user_id, req.body.question ,(err, authorised, question_id) =>
        {
            if(authorised == false) return res.sendStatus(403);
            if(err) return res.sendStatus(500);
            return res.status(201).send({ question_id: question_id });
        })
    })
}
const delete_question = (req,res) =>
{
    const question_id = req.params.question_id;

    // get the user id to later check if the user logged in is even authorised for this request
    user_model.get_ID_from_token(req.headers["x-authorization"], (err, user_id) =>
    {
        if(err) return res.sendStatus(500);
        if(!user_id) return res.sendStatus(401);

        question_model.delete_question(question_id, user_id, (err,question_found,authorised)=>
        {
            if(!question_found) return res.sendStatus(404);
            if(!authorised) return res.sendStatus(403); 
            if(err) return res.sendStatus(500);
            return res.sendStatus(200);
        })
    })
}

const up_vote_question = (req,res) =>
{
    const question_id = req.params.question_id;

    user_model.get_ID_from_token(req.headers["x-authorization"], (err, user_id) =>
    {
        if(err) return res.sendStatus(500);
        if(!user_id) return res.sendStatus(401);

        question_model.authorise_vote(question_id,user_id, (err,found,authorised) =>
        {   
            if(err) return res.sendStatus(500);
            if(!found) return res.sendStatus(404);
            if(!authorised) return res.sendStatus(403);
            question_model.up_vote_question(question_id,user_id,(err) =>
            {
                if(err) return res.sendStatus(500);
                return res.sendStatus(200);
            })
        })
    })
}

const down_vote_question = (req,res) =>
{
    user_model.get_ID_from_token(req.headers["x-authorization"], (err, user_id) =>
    {
            if(err) return res.sendStatus(500);
            if(!user_id) return res.sendStatus(401);
        question_model.authorise_vote(req.params.question_id, user_id, (err,found,authorised) =>
        {
            if(err) return res.sendStatus(500);
            if(!found) return res.sendStatus(404);
            if(!authorised) return res.sendStatus(403);

            question_model.down_vote_question(req.params.question_id, user_id, function(err)
            {
                if(err) return res.sendStatus(500);
                return res.sendStatus(200);
            })
        })
    })
}


module.exports = 
{
    ask_question,
    delete_question,
    up_vote_question,
    down_vote_question
}