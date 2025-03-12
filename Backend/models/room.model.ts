import mongoose from 'mongoose';

export interface IRoomModel extends mongoose.Document {
    address: string,
    name: string,
    roomNumber: string,
    roomOpens: string,
    roomCloses: string,
    capacity: number,
    type: "workspace" | "conference",

}

const roomSchema = new mongoose.Schema<IRoomModel>({
    address: { type: String, required: true },
    name: { type: String, required: true }, // company name or username at the owner 
    roomNumber: { type: String, required: true },
    roomOpens: { type: String, required: true },
    roomCloses: { type: String, required: true },
    capacity: { type: Number, required: true },
    type: { type: String, enum: ['workspace', 'conference'], required: true },
});

const Room = mongoose.model<IRoomModel>('Room', roomSchema)

export default Room;