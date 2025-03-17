import { IUser } from "../models/user.model.ts";  
import { IJwtPayload } from "./IJwtPayload.ts";

declare global {
    namespace Express {
        interface Request {
            user?: IUser;  
            JwtPayload?: IJwtPayload;
        }
    }
}
