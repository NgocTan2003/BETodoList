import mongoose from "mongoose";
import VerificationCodeType from "../constants/verificationCodeType";

export interface VerificationCodeDocument extends mongoose.Document {
    userId: mongoose.Schema.Types.ObjectId;
    type: VerificationCodeType;
    createdAt: Date;
    expiresAt: Date;
}

const verificationCodeSchema = new mongoose.Schema<VerificationCodeDocument>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
        index: true
    },
    type: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: Date.now,
    }
})

const VerificationCodeModel = mongoose.model<VerificationCodeDocument>("verification_codes", verificationCodeSchema);
export default VerificationCodeModel;


