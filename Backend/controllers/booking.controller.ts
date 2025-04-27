import { Request, response, Response } from "express";
import mongoose from 'mongoose';
import Booking from '../models/booking.model.ts';
import User, {IUser} from '../models/user.model.ts';
import Room, {IRoomModel} from '../models/room.model.ts';
import dayjs from 'dayjs'
import { logger } from '../utils/logger.utils.ts';
import { HTTP_STATUS } from "../constants/httpStatusCodes.ts";

export const createBooking = async(req: Request, res: Response) => {
    if (!req.user) {
        logger.error(`Could not find the user.`)
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
    }
    const client = req.app.get('redisclient');    
    const io = req.app.get('socketio');

    const {
        roomId: roomId,
        userId: userId,
        startTime: startTime, // Är XX:XX
        endTime: endTime, // Är XX:XX
        date: date,  // XXXX-XX-xx
    } = req.body;
    
    const modifiedStartDate = `${date}T${startTime}:00.000` // Ändrar till format som passar bättre till Date
    const modifiedEndDate = `${date}T${endTime}:00.000` // Ändrar till format som passar bättre till Date
    
    const existingBooking = await Booking.findOne({
        roomId,
        userId,
        startTime: modifiedStartDate,
        endTime: modifiedEndDate
    })

    if (existingBooking) {
        logger.error(`This booking already exsists.`)
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Booking already exists' });
        return;
    }

    const newBooking = new Booking({
        roomId,
        userId,
        startTime: modifiedStartDate,
        endTime: modifiedEndDate,
    });

    try {
        const user = await User.findById(userId);
        if (!user) {
            logger.error("There was an issue with the websocket when handeling the user.")
            res.status(HTTP_STATUS.NOT_FOUND).json({message: 'Could not find the user.'})
            return
        }
        const room = await Room.findById(roomId);
        if (!room) {
            logger.error("There was an issue with the websocket when handeling the room.")
            res.status(HTTP_STATUS.NOT_FOUND).json({message: 'Could not find the room.'})
            return
        }
        const owner = await User.findOne({username: room.name})
        if (!owner) {
            logger.error("There was an issue with the websocket when handeling the owner.")
            res.status(HTTP_STATUS.NOT_FOUND).json({message: 'Could not find the owner.'})
            return
        }

        // Städar cache för att senare updatera cache i getBookings.
        if (req.user.role === 'User') {
            await client.del(`booking:user:${req.user._id}`);
        } else if (req.user.role === 'Owner') {
            await client.del(`booking:owner:${req.user._id}`);
        } else if (req.user.role === 'Admin') {
            await client.del(`booking:admin:${req.user._id}`);
        } else {
            logger.error('There was an issue with deleting the cache.')
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({message: "There was an issue when sending back the data."})
            return
        }

        io.in(`${owner._id}`).emit('sendDataBooking', {
            messageOwner: `OWNER USER MESSAGE: ${user.username} created a booking at ${owner.username} - ${room.address}`
        });

        io.in(userId).emit('sendDataBooking', {
            messageUser: `NORMAL USER MESSAGE: ${user.username} created a booking at ${owner.username} - ${room.address}`,
        });

    } catch (e) {
        console.error(`THERE WAS AN ERROR: \n${e}`);
    }

    try {
        logger.info(`Adding the new booking to the database.`)
        await newBooking.save();
        res.status(HTTP_STATUS.CREATED).send()
    } catch (error : any) {
        if (error.code === 11000) { // MongoDBs Internal fel kod för om en duplicat finns.
            logger.info(`There was an duplicate of data.`)
            res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Duplicate data found.' });
            return
        } else {
            logger.info(`There was an error on the server side when creating the booking.`)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
            return
        }
    }
}

export const getBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            logger.error(`Could not find the user.`)
            res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
            return;
        }
        
        const { role, _id, username } = req.user;
        let query: any = {};
        const client = req.app.get('redisclient')

        /* Testning */
        const cutoff = dayjs().subtract(2, 'day').startOf('day').toDate();
        console.log('Deleting for user:', req.user._id, 'before', cutoff);
        console.log(
        'Would delete these documents:',
        await Booking.find({
            userId: req.user._id,
            endTime: { $lt: cutoff }
        })
        );

        const result = await Booking.deleteMany({
            userId: req.body._id,
            endTime: { $lt: dayjs().subtract(2, 'day').startOf('day').toDate() }
        });

        let cacheKey = ``
        if(role === "User") {
            cacheKey = `booking:user:${_id}`
        } else if(role === "Owner") {
            cacheKey = `booking:owner:${_id}`
        } else if(role === "Admin") {
            cacheKey = `booking:admin:${_id}`
        } else {
            logger.error('There was an error when getting the user role for the cache key.')
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({message: 'Invalid user role.'})
            return
        }

        const cachedData = await client.get(cacheKey);
        if (cachedData) {
            logger.info(`Bookings returned from cache (key: ${cacheKey}).`);
            res.status(HTTP_STATUS.OK).json(JSON.parse(cachedData));
            return
        }

        // Bestämer query som söks efter i booking.
        if (role === "User") {
            query = { userId: _id };
        }  
        else if (role === "Owner") {
            const ownedRooms = await Room.find({ name: username }).select("_id");
            if (ownedRooms.length === 0) {
                logger.info(`There were no bookings found sending back an empty array.`)
                res.status(HTTP_STATUS.NO_CONTENT).json({ bookings: [] });
                return;
            }
            const roomIds = ownedRooms.map(room => room._id);
            query = { roomId: { $in: roomIds } };
        } else if(role === "Admin"){
            query = {}
        } else {
            logger.error(`The users role was not found.`)
            res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Forbidden" });
            return;
        }

        const bookings = await Booking.find(query).lean();

        if (bookings.length === 0) {
            logger.info(`Bookings was empty returning an empty array.`)
            res.json({ bookings: [] });
            return;
        }

        // Gör så att bokningen skickas tillbaka tillsamans med information om rummet de har bokat.
        const roomIds = bookings.map(booking => booking.roomId);
        const rooms = await Room.find({ _id: { $in: roomIds } }).lean();
        const roomMap = new Map(rooms.map(room => [room._id.toString(), room]));

        const userIds = bookings.map(booking => booking.userId);
        const users = await User.find({ _id: { $in: userIds } })
            .select("_id name username")
            .lean();
        const userMap = new Map(users.map(user => [user._id.toString(), user]));
        const bookingsWithDetails = bookings.map(booking => ({
            ...booking,
            roomInfo: roomMap.get(booking.roomId.toString()) || null,
            userInfo: userMap.get(booking.userId.toString()) || null,
        }));
        
        await client.set(cacheKey, JSON.stringify({ bookings: bookingsWithDetails }));
        logger.info(`Bookings cached (key: ${cacheKey}).`);

        logger.info(`Sending back the bookings with the needed details.`)
        res.status(HTTP_STATUS.OK).json({ bookings: bookingsWithDetails });
    } catch (error) {
        logger.error(`Failed to fetch the bookings.`)
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch bookings" });
    }
};

export const updateBooking = async(req: Request, res: Response) => {
    if (!req.user) {
        logger.error(`Could not find the user.`)
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
    }

    try {
        const {
            endTime,
            startTime,
            selectDate
        } = req.body;
        const { id } = req.params;        
        const io = req.app.get('socketio');
        const client = req.app.get('redisclient');
        const reformattedEndTime = `${selectDate}T${endTime}:00.000`;
        const reformattedStartTime = `${selectDate}T${startTime}:00.000`;
        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { startTime: reformattedStartTime, endTime: reformattedEndTime },
            { new: true,runValidators: true }
        ) 

        if (req.user.role === 'User') {
            await client.del(`booking:user:${req.user._id}`);
        } else if (req.user.role === 'Owner') {
            await client.del(`booking:owner:${req.user._id}`);
        } else if (req.user.role === 'Admin') {
            await client.del(`booking:admin:${req.user._id}`);
        } else {
            logger.error('There was an issue with deleting the cache.')
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({message: "There was an issue when sending back the data."})
        }

        io.to(req.user._id).emit('sendBookingUpdate', {
            messageUser: `NORMAL USER MESSAGE: ${req.user.username} updated the booking with the ID of ${id}`,
        })

        logger.info(`The booking has been updated`)
        res.status(HTTP_STATUS.NO_CONTENT).send()
    } catch(error) {
        logger.error(`There was an error during when updating the booking`)
    }
}

export const removeBooking = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    if (!req.user) {
        logger.error("The user was not found")
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const userId = req.user._id;
    const userRole = req.user.role;
    const username = req.user.username;
    const io = req.app.get('socketio');
    const client = req.app.get('redisclient');    

    try {
        const booking = await Booking.findById(id);
        if (!booking) {
            logger.error("Could not find the booking in the Database")
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Booking not found" });
            return;
        }

        if (userRole === 'User' && booking.userId.toString() !== userId) {
            logger.error("The user has not yet been accepted by the Admins.")
            res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
            return;
        }

        if (userRole === 'Owner') {
            const rooms: IRoomModel[] = await Room.find({ name: username }).lean().exec();

            const isOwnerOfRoom = rooms.some((room: any) => room._id.toString() === booking.roomId.toString()); // Fixa senare.

            if (!isOwnerOfRoom) {
                logger.error("The user does not own that room.")
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
                return;
            }
        }
        await Booking.findByIdAndDelete(id);
        
        if (req.user.role === 'User') {
            await client.del(`booking:user:${req.user._id}`);
        } else if (req.user.role === 'Owner') {
            await client.del(`booking:owner:${req.user._id}`);
        } else if (req.user.role === 'Admin') {
            await client.del(`booking:admin:${req.user._id}`);
        } else {
            logger.error('There was an issue with deleting the cache.')
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({message: "There was an issue when sending back the data."})
            return
        }

        io.to(userId).emit('sendBookingDelete', {
            messageUser: `NORMAL USER MESSAGE: ${req.user.username} deleted the booking with the ID of ${id}`,    
        })

        logger.info("Succesfully removed the room.")
        res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
        logger.error("There was an error when removing the booking")
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};

export const getAllRoomBookings = async(req: Request, res: Response ) : Promise<void> => {
    const { id } = req.params;

    if (!req.user) {
        logger.error("Could not find the user")
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
    }

    try {
        const bookings = await Booking.find({ roomId: id })
        
        const bookingAvatarFormat = await Promise.all(
            bookings.map(async (booking) => {
                const user = await User.findOne({ _id: booking.userId });
                return {
                    username: user?.username,
                };
            })
        );

        logger.info("Succesfully sent back all the bookings for the Avatars")
        res.status(HTTP_STATUS.OK).json({ bookings: bookingAvatarFormat })
    } catch(err) {
        logger.error("There was an error when getting all the bookings.")
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server Error: When getting all the bookings" })
    }
}