const db = require("../../database.js");
const crypto = require('crypto');

// hash the input password to later compare to the hashed password in the db
const getHash = (password, salt) => {   return crypto.pbkdf2Sync(password, salt, 100000, 256, "sha256").toString('hex');    }

// CREATE ACCOUNT
// 1. Check if the email passed on is in use by an exsiting user
// 2. Add the new user to the db
const get_ID_from_email = (email, done) => 
{
    const sql = "SELECT * FROM users WHERE email = ?";
    db.get(sql, [email], (err, row) => 
    {
        if (!row) return done (err,null);
        return done(err,row.user_id);  
    });
}
const add_new_user = (user, done) => 
{
    const salt = crypto.randomBytes(64);
    const hash = getHash(user.password, salt);

    const sql = "INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)";
    const values = [user.first_name, user.last_name, user.email, hash, salt.toString('hex')];
    
    db.run(sql, values, function (err) {
        return done(this.lastID,err); 
    })
}

// LOGIN
// 1. authenticates the user but finding the input email 
//    and then hashing and checking the input password against the db
// 2. check if the user is logged in and if yes then return the token oif not 
// 3. sets token
const authenticate_login = (login_input,done) =>
{
    const sql = "SELECT user_id, password, salt FROM users WHERE email = ?";
    
    db.get(sql,login_input.email,(err,row) => 
    {
        if(!row) return done(err,null);

        if(row.salt === null) row.salt = '';
        let salt = Buffer.from(row.salt,'hex');

        if(row.password === getHash(login_input.password,salt)) {   return done(err,row.user_id); }
        else    {   return done(err,null);   }
    })
}
const get_token_from_id = (id,done)=>
{
    const sql = "SELECT session_token FROM users WHERE user_id = ?";

    db.get(sql,[id],(err,row) => 
    {
        if(!row) return done(err,null);
        return done(err,row.session_token);
    })
}
const set_token = (id , done) =>
{
    let token = crypto.randomBytes(16).toString('hex');

    const sql = 'UPDATE users SET session_token=? WHERE user_id=?';

    db.run(sql,[token,id],function(err){  return done(err,token); })
}

// LOGOUT
// 1. Removes token from where the token is stored in the db
const remove_token = (token , done) =>
{
    const sql = 'UPDATE users SET session_token = null WHERE session_token = ?';
    db.run(sql,[token],function(err){   return done(err);    })
}


// used in other controller models to identify the user by the token
const get_ID_from_token = (token , done) =>
{   
    const sql = "SELECT user_id FROM users WHERE session_token = ?";
    db.get(sql,[token],(err,row) =>
    {   
        if(!row) return done(err,null);
        return done(err,row.user_id);
    })
}



module.exports = 
{
    add_new_user,
    get_ID_from_email,
    get_ID_from_token,
    get_token_from_id,
    set_token,
    remove_token,
    authenticate_login
}