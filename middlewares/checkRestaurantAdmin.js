import jwt from "jsonwebtoken";
import ResOwner from "../models/restaurant/resOwnerModel.js";

const checkResOwner = async (req, res, next) => {

    try {
        const Authtoken = req.header("auth-token");
        const token = jwt.verify(Authtoken,  process.env.JWT_SECRET);
        const id = token.id;
        const Owner = await ResOwner.findOne({ _id:id })
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