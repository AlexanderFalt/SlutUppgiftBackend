import { Request, Response } from "express"
import User from '../models/user.model.ts';
import Room from '../models/room.model.ts';
import Booking from "../models/booking.model.ts";

export const getUsers = async(req: Request, res: Response) => {
    console.log("Getting the users")
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        
        const { role, username } = req.user;

        if (role !== "Admin") {
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

        res.status(200).send(modifiedUsers)
    } catch(e) {
        console.error(`There was an error at getUsers:\n ${e}`)
        res.status(500).send()
    }
}

export const deleteUser = async(req: Request, res: Response) => {
    console.log("Deleting the user")
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        
        const { role } = req.user;
        const { id } = req.params;

        if (role !== "Admin") {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        const userObject = await User.findById(id);
        console.log(userObject)
        if ( userObject?.role === "User" ) {
            await Booking.deleteMany({userId: userObject._id});
        } else if( userObject?.role === "Owner" ) {
            await Booking.deleteMany({userId: userObject._id});
            await Room.deleteMany({name: userObject.username});
        } else {
            console.log("Can not delete Admin user")
            res.status(403).send()
            return
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
          res.status(404).json({ message: 'Room not found' });
        }

        res.status(200).send({message: `Deleted user: ${user}`})
    } catch(e) {
        console.error(`There was an error at deleteUser:\n ${e}`)
        res.status(500).send()
    }
}

export const getRoleRaise = async(req: Request, res: Response) => {
    console.log("Getting all the users that want a role raise.")
    try {
        const users = await User.find({roleRaise: false, role: "Owner"})
        const modifiedUsers = users.map((user) => ({
            username: user.username,
            role: user.role,
            email: user.emailAddress,
            id: user._id
        }))
        res.status(200).send(modifiedUsers);
    } catch(e) {
        console.log(e)
        res.status(500).send()
    }
}

export const updateRoleRaise = async(req: Request, res: Response) => {
    const {
        id
    } = req.params;

    if (!req.user) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
      }
    const role = req.user.role;

    if (role !== "Admin") {
        res.status(403).send();
        return
    }

    console.log("Trying to update the role raise for user")
    try {
        await User.findOneAndUpdate({_id: id}, {roleRaise: true})
        res.status(200).send()
    } catch(e) {
        console.log(e)
        res.status(500).send({ error: "Failed to update roleRaise" });
    }
}