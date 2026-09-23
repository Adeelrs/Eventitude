const { token } = require("morgan");
const user_model = require("../models/user.model");
const Joi = require('joi');

// POST users
const create_account = (req, res) => 
{
    // Check if the input body is in the correct format (return 400 if not)
    const schema = Joi.object
    ({
        first_name: Joi.string().required(),
        last_name:  Joi.string().required(),
        email: Joi.string().email().required(), 
        password: Joi.string()
            .min(8)
            .max(20)
            .regex(/(?=.*[a-z])/) 
            .regex(/(?=.*[A-Z])/) 
            .regex(/(?=.*[0-9])/) 
            .required()           
    })
    
    const { error } = schema.validate(req.body);
    if (error) { return res.status(400).send({error_message: error.details[0].message })}
    
    // Check if the email passed on is in use by an exsiting user
    user_model.get_ID_from_email(req.body.email, (err,id) => 
    {
        if (id) { return res.status(400).send({ error_message: "User already exists"}); }
        if(err) return res.status(500).send({ error_message: "Error checking user existence" });
        
        // If all checks pass add the user to the db
        user_model.add_new_user(req.body, (user_id,err) => 
        {
            if (err) {  return res.status(500).send({ error_message: "Error adding user" }); }
            return res.status(201).send({ user_id: user_id }); 
        })
    })
}

// POST login
const login = (req,res) =>
{
    // Check if the input body is in the correct format 
    const schema = Joi.object
    ({
        email: Joi.string().email().required(),
        password: Joi.string()
        .min(8)
        .max(20)
        .regex(/(?=.*[a-z])/) 
        .regex(/(?=.*[A-Z])/) 
        .regex(/(?=.*[0-9])/) 
        .regex(/(?=.*[!@#$%^&*])/)
        .required()  
    })

    const { error } = schema.validate(req.body);
    if( error ) return res.status(400).send({ error_message: error.details[0].message });

    // Check the input password matches a user in the db
    user_model.authenticate_login(req.body,(err,id)=>
    {
        if(err) return res.sendStatus(500);
        if(id==null) return res.status(400).send("Password or Email is wrong please try again"); 
        
        
        user_model.get_token_from_id(id,(err,token)=>
        {
            if(err) return res.sendStatus(500);
            if(token){  return res.status(200).send({user_id: id, session_token: token});   }
            user_model.set_token(id,(err,set_token)=>
            {
                if(err) return res.sendStatus(500);
                return res.status(200).send({user_id: id, session_token: set_token});
            })
        })
    })
}

// POST logout (AUTHENTICATED)
const logout = (req,res) =>
{
    const token = req.headers["X-Authorization"];
    user_model.remove_token(token, function(err) 
    {
        if (err) {  return res.sendStatus(500);   }
        return res.sendStatus(200);
    })
}

module.exports = 
{
    create_account,
    login,
    logout   
}

