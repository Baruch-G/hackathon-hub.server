import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  password: string;
  lastName: string;
  email: string;
  imgUrl?: string;
  refreshTokens?: string[];
}

const userSchema = new Schema<IUser>({
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

// Method to remove sensitive information
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  return user;
};

export default mongoose.model<IUser>("User", userSchema);
