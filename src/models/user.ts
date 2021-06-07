import mongoose, { Document, Model } from 'mongoose';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

interface UserModel extends Omit<User, '_id'>, Document {}

const schema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    email: {
      type: String,
      require: true,
      unique: [true, 'Email must be unique'],
    },
    password: { type: String, require: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret._v;
      },
    },
  }
);

export const User: Model<UserModel> = mongoose.model('User', schema);