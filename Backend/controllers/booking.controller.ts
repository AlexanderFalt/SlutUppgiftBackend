import { Request, Response } from "express";
import mongoose from 'mongoose';
import Booking from '../models/booking.model.ts';
import User from '../models/user.model.ts';
import Room, {IRoomModel} from '../models/room.model.ts';

export const createBooking = async(req: Request, res: Response) => {
    console.log("Creating booking")
    console.log("This is the date: " + new Date())
    const {
        roomId: roomId,
        userId: userId,
        startTime: startTime,
        endTime: endTime,
        date: date,
    } = req.body;
    const existingBooking = await Booking.findOne({ userId, roomId });
    if (existingBooking) {
        res.status(400).json({ message: 'Booking already exists' });
        return;
    }
    const modifiedStartDate = `${date}T${startTime}:00.000`
    const modifiedEndDate = `${date}T${endTime}:00.000`
    console.log(`CONTROL CHECK: \n\n These were the values \n userId: ${userId} \n roomId: ${roomId} \n startTime: ${startTime} \n endTime: ${endTime} \n date: ${date}. \n\n The modified values were: \n ${modifiedStartDate} \n ${modifiedEndDate}`)


    const newBooking = new Booking({
        roomId,
        userId,
        startTime: modifiedStartDate,
        endTime: modifiedEndDate,
    });

    try {
        await newBooking.save();
    } catch (error : any) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Duplicate data found.' });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
        console.error("Error saving booking:", error);
    }
}
export const getBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { role, _id, username } = req.user;
        let query: any = {};

        if (role === "User") {
            query = { userId: _id };
        } 
        else if (role === "Owner") {
            const ownedRooms = await Room.find({ name: username }).select("_id");
            if (ownedRooms.length === 0) {
                res.json({ bookings: [] });
                return;
            }
            const roomIds = ownedRooms.map(room => room._id);
            query = { roomId: { $in: roomIds } };
        } else if(role === "Admin"){
            query = {}
        } else {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        const bookings = await Booking.find(query).lean();

        if (bookings.length === 0) {
            res.json({ bookings: [] });
            return;
        }

        const roomIds = bookings.map(booking => booking.roomId);
        const rooms = await Room.find({ _id: { $in: roomIds } }).lean();
        const roomMap = new Map(rooms.map(room => [room._id.toString(), room]));

        const userIds = bookings.map(booking => booking.userId);
        const users = await User.find({ _id: { $in: userIds } })
            .select("_id name username") // <-- Only return these fields
            .lean();
        const userMap = new Map(users.map(user => [user._id.toString(), user]));

        const bookingsWithDetails = bookings.map(booking => ({
            ...booking,
            roomInfo: roomMap.get(booking.roomId.toString()) || null,
            userInfo: userMap.get(booking.userId.toString()) || null,
        }));

        res.json({ bookings: bookingsWithDetails });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
};

export const updateBooking = async(req: Request, res: Response) => {
    console.log("Updating the booking")

    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const {
            endTime,
            startTime,
            selectDate
        } = req.body;
        console.log(endTime, startTime, selectDate)
        const { id } = req.params;        
        const reformattedEndTime = `${selectDate}T${endTime}:00.000`;
        const reformattedStartTime = `${selectDate}T${startTime}:00.000`;
        console.log(reformattedEndTime, reformattedStartTime)
        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { startTime: reformattedStartTime, endTime: reformattedEndTime },
            { new: true,runValidators: true }
        )

        console.log(`New booking: \n${updatedBooking}`)

        res.status(204).send()
    } catch(error) {
        console.log(error)
    }
}

export const removeBooking = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const userId = req.user._id;
    const userRole = req.user.role;
    const username = req.user.username;

    try {
        const booking = await Booking.findById(id);
        if (!booking) {
            res.status(404).json({ message: "Booking not found" });
            return;
        }

        if (userRole === 'User' && booking.userId.toString() !== userId) {
            res.status(403).json({ message: "Unauthorized" });
            return;
        }

        if (userRole === 'Owner') {
            const rooms: IRoomModel[] = await Room.find({ name: username }).lean().exec();

            const isOwnerOfRoom = rooms.some((room: any) => room._id.toString() === booking.roomId.toString()); // Fixa senare.

            if (!isOwnerOfRoom) {
                res.status(403).json({ message: "Unauthorized" });
                return;
            }
        }
        
        await Booking.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getAllRoomBookings = async(req: Request, res: Response ) : Promise<void> => {
    const { id } = req.params;

    if (!req.user) {
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

        res.status(200).json({ bookings: bookingAvatarFormat })
    } catch(err) {
        console.error(err)
        res.status(500).json({ message: "Server Error: When getting all the bookings" })
    }
}