// users.js
import mongoose from 'mongoose';
import express from 'express';
const router = express.Router();

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
export default User;
