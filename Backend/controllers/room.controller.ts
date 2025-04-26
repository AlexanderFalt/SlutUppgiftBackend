import Room from '../models/room.model.ts';
import Booking from '../models/booking.model.ts';
import User from '../models/user.model.ts';
import { logger } from '../utils/logger.utils.ts';
import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatusCodes.ts';

export const createRoom = async(req: Request, res: Response) : Promise<void> => {
    
    if (!req.user) {
        logger.error(`Something went wrong when finding the user.`)
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
    }

    const client = req.app.get('redisclient');
    const io = req.app.get('socketio');

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
            res.status(HTTP_STATUS.UNAUTHORIZED).json({message: "The users application has not yet been accepted."})
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

        try {
            const updatedRooms = await Room.find().lean();
            await client.set('roomCache', JSON.stringify(updatedRooms));
        } catch(e) {
            logger.error("There was an error when updating the cache for the rooms.")
        }

        io.to(req.user._id).emit('createdRoom', {
            messageOwner: `${req.user.username} created a new room.`
        })
        logger.error(`The room has been created and added to the database.`)
        res.status(HTTP_STATUS.CREATED).json(newRoom)
    } catch(error) {
        logger.error(`There was an error on the server side.`)
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error' })
    }
}

export const getRooms = async(req: Request, res: Response) :  Promise<void> => {
    if (!req.user) {
        logger.error(`User was not found.`)
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
    }

    const client = req.app.get('redisclient');

    try {
        const data = JSON.parse(await client.get('roomCache'));
        if(!data) {
            const rooms = await Room.find({}).lean();
            await client.set('roomCache', JSON.stringify(rooms));
            logger.info(`The rooms are being sent back to the frontend from the DB.`)
            res.status(HTTP_STATUS.OK).json(rooms);
            return    
        }
        logger.info('The rooms are being sent back to the frontend from the cache.')
        res.status(HTTP_STATUS.OK).json(data)
    } catch(error) {
        logger.error(`Something went wrong when trying to fetch the rooms.`)
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'An error occurred while fetching rooms.' });
    }
}

export const removeRoom = async(req: Request, res: Response) : Promise<void> => {
    if (!req.user) {
        logger.error(`The user could not be found.`)
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Unauthorized" });
        return;
    }

    const client = req.app.get('redisclient');

    try {
        const { id } = req.params;
        const io = req.app.get('socketio');
        await Booking.deleteMany({roomId: id});
        const room = await Room.findByIdAndDelete(id);
        if (!room) {
            logger.error(`Could not find the room.`)
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Room not found' });
            return
        }

        try {
            const updatedRooms = await Room.find().lean();
            await client.set('roomCache', JSON.stringify(updatedRooms));
        } catch(e) {
            logger.error("There was an error when updating the cache for the rooms.")
        }

        io.to(req.user._id).emit('removedRoom', {
            messageOwner: `${req.user.username} removed the room with the ID of ${id}`
        })
        logger.info(`The room was succesfully deleted.`)
        res.status(HTTP_STATUS.OK).json({ message: 'Room deleted successfully' });
    } catch(error) {
        logger.error(`There was an error during the deletion function.`)
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Deletion Error'})
    }
}

export const updateRoom = async(req: Request, res: Response) : Promise<void> => {

    if (!req.user) {
        logger.error(`Could not find the user.`)
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
    }

    const client = req.app.get('redisclient');

    try {
        const {id} = req.params;
        const io = req.app.get('socketio');
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
            res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" })
            return
        }
        const updatedRoom = await Room.findByIdAndUpdate(
            id,
            { address, name, roomNumber, roomOpens, roomCloses, capacity, type },
            { new: true, runValidators: true }
        );
      
        if (!updatedRoom) {
            logger.error(`Could not find the room.`)
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Room not found' });
            return;
        }

        try {
            const updatedRooms = await Room.find().lean();
            await client.set('roomCache', JSON.stringify(updatedRooms));
        } catch(e) {
            logger.error("There was an error when updating the cache for the rooms.")
        }

        io.to(req.user._id).emit('updateRoom', {
            messageOwner: `${req.user.username} updated the room with the ID of ${id}`
        })

        logger.info(`The room was succesfully updated.`)
        res.status(HTTP_STATUS.NO_CONTENT).send()
    } catch(error) {
        logger.error(`There was an updated error on the server side.`)
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Update Error'})
    }
}