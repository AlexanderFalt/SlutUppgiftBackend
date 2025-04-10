import Room from '../models/room.model.ts';
import Booking from '../models/booking.model.ts';
import User from '../models/user.model.ts';
import { logger } from '../utils/logger.utils.ts';
import { Request, Response } from 'express';

export const createRoom = async(req: Request, res: Response) : Promise<void> => {
    
    if (!req.user) {
        logger.error(`Something went wrong when finding the user.`)
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try{
        const {
            address, 
            name, 
            roomNumber, 
            roomOpens, 
            roomCloses, 
            capacity, 
            type
        } = req.body;
        
        const userObject = await User.findOne({username: name})

        if (userObject?.roleRaise === false) {
            logger.error(`The users application has not yet been accepted.`)
            res.status(403).send()
            return
        }

        const newRoom = new Room({
            address,
            name,
            roomNumber,
            roomOpens,
            roomCloses,
            capacity,
            type,
        })

        await newRoom.save()

        logger.error(`The room has been created and added to the database.`)
        res.status(201).json(newRoom)
    } catch(error) {
        logger.error(`There was an error on the server side.`)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getRooms = async(req: Request, res: Response) :  Promise<void> => {
    
    if (!req.user) {
        logger.error(`There seems to be something wrong with the `)
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const rooms = await Room.find({}).lean();
        logger.info(`The rooms are being sent back to the frontend.`)
        res.status(200).json(rooms);
    } catch(error) {
        logger.error(`Something went wrong when trying to fetch the rooms.`)
        res.status(500).json({ error: 'An error occurred while fetching rooms.' });
    }
}

export const removeRoom = async(req: Request, res: Response) : Promise<void> => {
    
    if (!req.user) {
        logger.error(`The user could not be found.`)
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const { id } = req.params;
        await Booking.deleteMany({roomId: id});
        const room = await Room.findByIdAndDelete(id);
        if (!room) {
            logger.error(`Could not find the room.`)
            res.status(404).json({ message: 'Room not found' });
            return
        }
        logger.info(`The room was succesfully deleted.`)
        res.status(200).json({ message: 'Room deleted successfully' });
    } catch(error) {
        logger.error(`There was an error during the deletion function.`)
        res.status(500).json({ message: 'Deletion Error'})
    }
}

export const updateRoom = async(req: Request, res: Response) : Promise<void> => {

    if (!req.user) {
        logger.error(`Could not find the user.`)
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    

    try {
        const {id} = req.params;
        const {
            address,
            name,
            roomNumber,
            roomOpens,
            roomCloses,
            capacity,
            type,
        } = req.body;

        const userObject = await User.findOne({username: name})
        if (userObject?.roleRaise === false) {
            logger.error(`The application has not yet been accepted.`)
            res.status(403).send()
            return
        }
        const updatedRoom = await Room.findByIdAndUpdate(
            id,
            { address, name, roomNumber, roomOpens, roomCloses, capacity, type },
            { new: true, runValidators: true }
        );
      
        if (!updatedRoom) {
            logger.error(`Could not find the room.`)
            res.status(404).json({ message: 'Room not found' });
            return;
        }

        logger.info(`The room was succesfully updated.`)
        res.status(204).send()
    } catch(error) {
        logger.error(`There was an updated error on the server side.`)
        res.status(500).json({ message: 'Update Error'})
    }
}