import mongoose from "mongoose";

export interface Car {
    _id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    hand: number;
    color: string;
    mileage: number;
}

const carSchema = new mongoose.Schema<Car>({
    _id: {
        type: String,
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
});

export default mongoose.model<Car>("Cars", carSchema);
