import mongoose from "mongoose";

export interface Car {
  _id?: mongoose.Schema.Types.ObjectId;
  make: string;
  model: string;
  year: number;
  price: number;
  hand: number;
  color: string;
  mileage: number;
  city: string;
  owner: string;
  imgsUrls?: string[];
}

const carSchema = new mongoose.Schema<Car>({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: new mongoose.Types.ObjectId()
  },
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  hand: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  mileage: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  imgsUrls: {
    type: [String],
  },
});

export default mongoose.model<Car>("Car", carSchema);
