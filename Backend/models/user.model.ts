import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends mongoose.Document {
  username: string;
  name?: string;
  emailAddress: string;
  password: string;
  roleRaise?: boolean;
  role: 'User' | 'Admin' | 'Owner';
}

const userSchema = new mongoose.Schema<IUser>({
    username: { type: String, required: true, unique: true },
    name: {type: String}, 
    emailAddress: {type: String, required: true},
    password: { type: String, required: true },
    roleRaise: {type: Boolean},
    role: { type: String, enum: ['User', 'Admin', 'Owner'], default: 'User' },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Om lösenordet har redan hashat fortsätt till nästa function.
    this.password = await bcrypt.hash(this.password, 10); // Hashar lösenordet med 10 saltnings rundor. 
    next();
});

export default mongoose.model<IUser>('User', userSchema);
