import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user_model";

interface Location {
  lon: number;
  lat: number;
}

interface Comment {
  user: mongoose.Schema.Types.ObjectId | IUser;
  text: string;
  date: Date;
}

export interface IHackathon extends Document {
  creator: mongoose.Schema.Types.ObjectId | IUser;
  location: Location;
  startDate: Date;
  endDate: Date;
  description: string;
  comments: Comment[];
  imgs: string[];
  likes: string[];
  dateCreated: Date;
}

const commentSchema = new Schema<Comment>({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const locationSchema = new Schema<Location>({
  lon: { type: Number, required: true },
  lat: { type: Number, required: true }
});

const hackathonSchema = new Schema<IHackathon>({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    select: "firstName lastName email imgUrl" // Exclude password and refreshTokens
  },
  location: {
    type: locationSchema,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  comments: {
    type: [commentSchema],
    default: []
  },
  imgs: {
    type: [String],
    default: []
  },
  likes: {
    type: [String],
    default: []
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  }
});

export default mongoose.model<IHackathon>("Hackathon", hackathonSchema);
