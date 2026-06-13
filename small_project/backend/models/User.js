import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    phone: { type: Number, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true, minlength: 6, select: false },
    role: { type: String, enum: ["SUPER ADMIN", "ADMIN", "USER"], default: "USER" },
    credits: { type: Number, default: 0 },
    totalCreditsUsed:
    isActive: { type: Number, default: 0 }
})