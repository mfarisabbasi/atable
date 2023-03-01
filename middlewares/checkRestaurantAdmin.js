const expressAsyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const ResOwner = require('../models/restaurant/resOwnerModel');


const checkResOwner = async (req, res, next) => {

    try {
        const Authtoken = req.header("auth-token");
        const token = jwt.verify(Authtoken, process.env.JWT_SECRET);
        const _id = token._id;

        const Owner = await ResOwner.find({ _id })
        if (Owner) {
            req.user = Owner;
            next();
        }
        else {
            return res.status(400).json({ message: "UnAuthorized..." })
        }
    }
    catch (error) {
        return res.status(400).json({ message: "something bad happened..." })
    }
}

export { checkResOwner }