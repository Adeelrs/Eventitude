const events = require("../controllers/event.server.controllers");
const authenticate = require("../lib/authentication.js");

module.exports = function(app) 
{
    app.route("/events")
        .post(authenticate, events.create_new_event);

    app.route("/event/:event_id")
        .get(events.get_single_event)
        .patch(authenticate, events.update_event)
        .post(authenticate, events.register_event)
        .delete(authenticate, events.delete_event);
       
    app.route("/search")
        .get(authenticate,events.search);
}

