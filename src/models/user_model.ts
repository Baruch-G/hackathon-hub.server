import mongoose, { Schema } from "mongoose";

export interface IUser {
//   _id?: mongoose.Types.ObjectId;
  firstName: string;
  password: string;
  lastName: string;
  email: string;
  imgUrl?: string;
  refreshTokens?: string[];
}

const userSchema = new Schema<IUser>({
//   _id: {
//     type: mongoose.Types.ObjectId,
//   },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  imgUrl: {
    type: String,
  },
  refreshTokens: {
    type: [String]
  },
});

export default mongoose.model<IUser>("User", userSchema);
