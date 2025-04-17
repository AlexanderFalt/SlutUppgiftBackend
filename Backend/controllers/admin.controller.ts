import { Request, Response } from "express"
import User from '../models/user.model.ts';
import Room from '../models/room.model.ts';
import Booking from "../models/booking.model.ts";
import { logger } from '../utils/logger.utils.ts'

export const getUsers = async(req: Request, res: Response) => {
    try {
        if (!req.user) {
            logger.error("The user was not found")
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        
        const { role, username } = req.user;

        if (role !== "Admin") {
            logger.error("The user was not an Admin")
            res.status(403).json({ message: "Forbidden" });
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
        res.status(200).send(modifiedUsers)
    } catch(e) {
        logger.error("There was an error when getting the users")
        res.status(500).send()
    }
}

export const deleteUser = async(req: Request, res: Response) => {
    try {
        if (!req.user) {
            logger.error("The user was not found")
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        
        const { role } = req.user;
        const { id } = req.params;
        const io = req.app.get('socketio');

        if (role !== "Admin") {
            logger.error("The user was not an Admin")
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        const userObject = await User.findById(id);
        if ( userObject?.role === "User" ) {
            await Booking.deleteMany({userId: userObject._id});
        } else if( userObject?.role === "Owner" ) {
            await Booking.deleteMany({userId: userObject._id});
            await Room.deleteMany({name: userObject.username});
        } else {
            res.status(403).send()
            return
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            logger.error("The user was not found")
            res.status(404).json({ message: 'Room not found' });
        }

        io.to(req.user._id).emit('removedUser', {
            messageAdmin: `${req.user.username} removed the user ${userObject.username}`
        })

        logger.info("The user was succesfully removed")
        res.status(200).send({message: `Deleted user: ${user}`})
    } catch(e) {
        logger.error("There was an error when trying to remove the user")
        res.status(500).send()
    }
}

export const getRoleRaise = async(req: Request, res: Response) => {
    if (!req.user) {
        logger.error("Could not find the user")
        res.status(401).json({ message: "Unauthorized" });
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
        res.status(200).send(modifiedUsers);
    } catch(e) {
        logger.error("There was an error when trying to find the applicants")
        res.status(500).send()
    }
}

export const updateRoleRaise = async(req: Request, res: Response) => {
    const {
        id
    } = req.params;

    if (!req.user) {
         logger.error("Could not find the user")
         res.status(401).send({ error: 'Unauthorized' });
         return;
      }

    const role = req.user.role;
    const io = req.app.get('socketio');

    if (role !== "Admin") {
        logger.error("The user was not an Admin")
        res.status(403).send();
        return
    }

    try {
        const newUser = await User.findOneAndUpdate({_id: id}, {roleRaise: true})
            
        if(!newUser) {
            res.status(500).send({message: "The newUser was not found"})
            return
        }

        io.to(req.user._id).emit('raiseUserRole', {
            messageAdmin: `${req.user.username} raised the role of ${newUser.username ? newUser.username + '.' : "a user."}`
        })

        logger.info("The role raise was succesfully updated")
        res.status(200).send()
    } catch(e) {
        logger.error("There was an error when trying to raise the role.")
        res.status(500).send({ error: "Failed to update roleRaise" });
    }
}