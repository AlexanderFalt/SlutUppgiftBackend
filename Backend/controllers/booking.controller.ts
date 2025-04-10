import { Request, Response } from "express";
import mongoose from 'mongoose';
import Booking from '../models/booking.model.ts';
import User from '../models/user.model.ts';
import Room, {IRoomModel} from '../models/room.model.ts';
import dayjs from 'dayjs'
import { logger } from '../utils/logger.utils.ts';

export const createBooking = async(req: Request, res: Response) => {
    if (!req.user) {
        logger.error(`Could not find the user.`)
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const {
        roomId: roomId,
        userId: userId,
        startTime: startTime,
        endTime: endTime,
        date: date,
    } = req.body;
    const existingBooking = await Booking.findOne({ userId, roomId });
    if (existingBooking) {
        logger.error(`This booking already exsists.`)
        res.status(400).json({ message: 'Booking already exists' });
        return;
    }
    const modifiedStartDate = `${date}T${startTime}:00.000`
    const modifiedEndDate = `${date}T${endTime}:00.000`
    const newBooking = new Booking({
        roomId,
        userId,
        startTime: modifiedStartDate,
        endTime: modifiedEndDate,
    });

    try {
        logger.info(`Adding the new booking to the database.`)
        await newBooking.save();
    } catch (error : any) {
        if (error.code === 11000) {
            logger.info(`There was an duplicate of data.`)
            res.status(400).json({ message: 'Duplicate data found.' });
        } else {
            logger.info(`There was an error on the server side when creating the booking.`)
            res.status(500).json({ message: 'Server error' });
        }
    }
}

export const getBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            logger.error(`Could not find the user.`)
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { role, _id, username } = req.user;
        let query: any = {};

        const result = await Booking.deleteMany({
            userId: req.user._id,
            endTime: { $lt: dayjs().subtract(2, 'day').startOf('day').toDate() }
        });

        if (role === "User") {
            query = { userId: _id };
        } 
        else if (role === "Owner") {
            const ownedRooms = await Room.find({ name: username }).select("_id");
            if (ownedRooms.length === 0) {
                logger.info(`There were no bookings found sending back an empty array.`)
                res.json({ bookings: [] });
                return;
            }
            const roomIds = ownedRooms.map(room => room._id);
            query = { roomId: { $in: roomIds } };
        } else if(role === "Admin"){
            query = {}
        } else {
            logger.error(`The users role was not found.`)
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        const bookings = await Booking.find(query).lean();

        if (bookings.length === 0) {
            logger.info(`Bookings was empty returning an empty array.`)
            res.json({ bookings: [] });
            return;
        }

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
        logger.info(`Sending back the bookings with the needed details.`)
        res.json({ bookings: bookingsWithDetails });
    } catch (error) {
        logger.error(`Failed to fetch the bookings.`)
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
};

export const updateBooking = async(req: Request, res: Response) => {
    if (!req.user) {
        logger.error(`Could not find the user.`)
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const {
            endTime,
            startTime,
            selectDate
        } = req.body;
        const { id } = req.params;        
        const reformattedEndTime = `${selectDate}T${endTime}:00.000`;
        const reformattedStartTime = `${selectDate}T${startTime}:00.000`;
        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { startTime: reformattedStartTime, endTime: reformattedEndTime },
            { new: true,runValidators: true }
        )
        logger.info(`The booking has been updated`)
        res.status(204).send()
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

    try {
        const booking = await Booking.findById(id);
        if (!booking) {
            logger.error("Could not find the booking in the Database")
            res.status(404).json({ message: "Booking not found" });
            return;
        }

        if (userRole === 'User' && booking.userId.toString() !== userId) {
            logger.error("The user has not yet been accepted by the Admins.")
            res.status(403).json({ message: "Unauthorized" });
            return;
        }

        if (userRole === 'Owner') {
            const rooms: IRoomModel[] = await Room.find({ name: username }).lean().exec();

            const isOwnerOfRoom = rooms.some((room: any) => room._id.toString() === booking.roomId.toString()); // Fixa senare.

            if (!isOwnerOfRoom) {
                logger.error("The user does not own that room.")
                res.status(403).json({ message: "Unauthorized" });
                return;
            }
        }
        
        await Booking.findByIdAndDelete(id);
        logger.info("Succesfully removed the room.")
        res.status(204).send();
    } catch (error) {
        logger.error("There was an error when removing the booking")
        res.status(500).json({ message: "Server error" });
    }
};

export const getAllRoomBookings = async(req: Request, res: Response ) : Promise<void> => {
    const { id } = req.params;

    if (!req.user) {
        logger.error("Could not find the user")
        res.status(401).json({ message: "Unauthorized" });
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
        res.status(200).json({ bookings: bookingAvatarFormat })
    } catch(err) {
        logger.error("There was an error when getting all the bookings.")
        res.status(500).json({ message: "Server Error: When getting all the bookings" })
    }
}