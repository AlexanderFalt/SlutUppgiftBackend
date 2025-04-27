import { Request, Response } from "express"
import User from '../models/user.model.ts';
import Room from '../models/room.model.ts';
import Booking from "../models/booking.model.ts";
import { logger } from '../utils/logger.utils.ts'
import { HTTP_STATUS } from "../constants/httpStatusCodes.ts";

export const getUsers = async(req: Request, res: Response) => {
    /* Hämtar alla användare */
    try {
        if (!req.user) {
            logger.error("The user was not found")
            res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Unauthorized" });
            return;
        }
        
        const { role, username } = req.user;

        if (role !== "Admin") {
            logger.error("The user was not an Admin")
            res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Forbidden" });
            return;
        }

        const users = await User.find({role:  { $in: ["Owner", "User"] }}).lean()

        const modifiedUsers = users.map((user) => ({
            username: user.username,
            name: user.name,
            id: user._id,
            email: user.emailAddress,
            role: user.role
        }))



        logger.info("Succesfully got all the users")
        res.status(HTTP_STATUS.OK).send(modifiedUsers)
    } catch(e) {
        logger.error("There was an error when getting the users")
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send()
    }
}

export const deleteUser = async(req: Request, res: Response) => {
    /* Raderar en användare */
    try {
        if (!req.user) {
            logger.error("The user was not found")
            res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
            return;
        }
        
        const { role } = req.user;
        const { id } = req.params;
        const io = req.app.get('socketio');

        if (role !== "Admin") {
            logger.error("The user was not an Admin")
            res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Forbidden" });
            return;
        }

        // Tar bort alla delar som är beroende av den användaren.
        const userObject = await User.findById(id);
        if ( userObject?.role === "User" ) {
            await Booking.deleteMany({userId: userObject._id});
        } else if( userObject?.role === "Owner" ) {
            await Booking.deleteMany({userId: userObject._id});
            await Room.deleteMany({name: userObject.username});
        } else {
            res.status(HTTP_STATUS.FORBIDDEN).send()
            return
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            logger.error("The user was not found")
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Room not found' });
        }

        io.to(req.user._id).emit('removedUser', {
            messageAdmin: `${req.user.username} removed the user ${userObject.username}`
        })

        logger.info("The user was succesfully removed")
        res.status(HTTP_STATUS.OK).send({message: `Deleted user: ${user}`})
    } catch(e) {
        logger.error("There was an error when trying to remove the user")
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send()
    }
}

export const getRoleRaise = async(req: Request, res: Response) => {
    /* Hämta ägare (Owner) om dom letar efter godkännande. */
    if (!req.user) {
        logger.error("Could not find the user")
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
    }
    
    try {
        const users = await User.find({roleRaise: false, role: "Owner"})
        const modifiedUsers = users.map((user) => ({
            username: user.username,
            role: user.role,
            email: user.emailAddress,
            id: user._id
        }))
        logger.info("Succesfully got all the applicants")
        res.status(HTTP_STATUS.OK).send(modifiedUsers);
    } catch(e) {
        logger.error("There was an error when trying to find the applicants")
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send()
    }
}

export const updateRoleRaise = async(req: Request, res: Response) => {
    /* Godkänner ägare (Owner) applikationer. */
    const {
        id
    } = req.params;

    if (!req.user) {
         logger.error("Could not find the user")
         res.status(HTTP_STATUS.UNAUTHORIZED).send({ error: 'Unauthorized' });
         return;
      }

    const role = req.user.role;
    const io = req.app.get('socketio');

    if (role !== "Admin") {
        logger.error("The user was not an Admin")
        res.status(HTTP_STATUS.FORBIDDEN).send();
        return
    }

    try {
        const newUser = await User.findOneAndUpdate({_id: id}, {roleRaise: true})
            
        if(!newUser) {
            res.status(HTTP_STATUS.NOT_FOUND).send({message: "The newUser was not found"})
            return
        }

        io.to(req.user._id).emit('raiseUserRole', {
            messageAdmin: `${req.user.username} raised the role of ${newUser.username ? newUser.username + '.' : "a user."}`
        })

        logger.info("The role raise was succesfully updated")
        res.status(HTTP_STATUS.OK).send()
    } catch(e) {
        logger.error("There was an error when trying to raise the role.")
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ error: "Failed to update roleRaise" });
    }
}