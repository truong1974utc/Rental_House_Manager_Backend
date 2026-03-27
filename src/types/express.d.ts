import { ITenant } from "../models/Tenant.js";
import { Types } from "mongoose";

declare global {
    namespace Express {
        interface Request {
            tenant?: ITenant & { _id: Types.ObjectId };
        }
    }
}
