const UserModel = require('../models/user.model');

const authenticate = (req, res, next) => 
{
    const token = req.headers['x-authorization'];
    if (!token) return res.status(401).send({ error_message: "Unauthorized" });

    UserModel.get_ID_from_token(token, (err, id) =>
    {
        if(err) return res.sendStatus(500);
        if (!id) return res.status(401).send({ error_message: "Unauthorized" });
        next();
    });

}

module.exports = authenticate;
