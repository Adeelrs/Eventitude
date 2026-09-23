const question = require("../controllers/question.server.controllers");
const authenticate = require("../lib/authentication.js");


module.exports = function(app) 
{
    app.route("/event/:event_id/question")
        .post(authenticate, question.ask_question);

    app.route("/question/:question_id")
        .delete(authenticate, question.delete_question);
       
    app.route("/question/:question_id/vote")
        .post(authenticate, question.up_vote_question)
        .delete(authenticate, question.down_vote_question);
        

} 