import mongoose from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

export interface UserDocument extends mongoose.Document {
    fullName: string;
    email: string;
    password?: string;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword: (val: string) => Promise<boolean>;
    omitPassword: () => Omit<UserDocument, "password">;
}

// timestamps: true tự động thêm createdAt và updatedAt vào bảng
const userSchema = new mongoose.Schema<UserDocument>({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        required: true,
        default: false,
    },
}, { timestamps: true });


userSchema.pre("save", async function (next) {
    // ktra xem password có bị thay đổi k
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await hashValue(this.password || '', 8);
    next();
});

// hàm so sánh password khi đăng nhập
userSchema.methods.comparePassword = async function (val: string) {
    return compareValue(val, this.password);
}

userSchema.methods.omitPassword = function () {
    const { password, ...rest } = this.toObject();  
    return rest;
}

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
