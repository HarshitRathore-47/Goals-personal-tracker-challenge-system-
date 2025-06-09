import mongoose from 'mongoose';

const trackerSchema = new mongoose.Schema({
  email: { type: String, required: true },
  sleepHours: Number,
  waterLiters: Number,
  screenTime: Number,
  gymTime: Number,
  mealsCount: Number,
  fvServings: Number,
  stepsWalked: Number,
  score: Number,
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Tracker', trackerSchema);
