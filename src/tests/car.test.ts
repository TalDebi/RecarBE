import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import CarModel, { Car } from "../models/car";
import { Express } from "express";
import User from "../models/user";
import { Types } from "mongoose";

let app: Express;
let userId: string;
let accessToken: string;
const user = {
  email: "testStudent@test.com",
  password: "1234567890",
  name: "Testy",
};
const car: Car = {
  _id: new Types.ObjectId("65da55c45ddd0693dd576dd7"),
  make: "toyota",
  model: "camry",
  year: 2010,
  price: 40000,
  hand: 2,
  color: "black",
  mileage: 100000,
  city: "Holon",
  owner: "",
};
beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await CarModel.deleteMany();

  User.deleteMany({ email: user.email });
  const response = await request(app).post("/auth/register").send(user);
  userId = response.body.user._id;
  car["owner"] = userId;
  accessToken = response.body.tokens.accessToken;
});

afterAll(async () => {
  await User.findByIdAndDelete(userId);
  await mongoose.connection.close();
});

describe("Car tests", () => {
  const addCar = async (car: Car) => {
    const response = await request(app)
      .post("/car")
      .set("Authorization", "JWT " + accessToken)
      .send(car);
    expect(response.statusCode).toBe(201);
  };
  test("Test Get All Cars - empty response", async () => {
    const response = await request(app)
      .get("/car")
      .set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual([]);
  });

  test("Test Post Car", async () => {
    addCar(car);
  });

  test("Test Get All Cars with one car in DB", async () => {
    const response = await request(app)
      .get("/car")
      .set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    const postedCar = response.body[0];
    expect(postedCar._id).toBe(String(car._id));
    expect(postedCar.make).toBe(car.make);
    expect(postedCar.model).toBe(car.model);
    expect(postedCar.year).toBe(car.year);
    expect(postedCar.price).toBe(car.price);
    expect(postedCar.hand).toBe(car.hand);
    expect(postedCar.color).toBe(car.color);
    expect(postedCar.mileage).toBe(car.mileage);
    expect(postedCar.city).toBe(car.city);
    expect(postedCar.owner).toBe(car.owner);
  });

  test("Test Get colors", async () => {
    const response = await request(app)
      .get("/car/colors")
      .set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
  test("Test Get cities", async () => {
    const response = await request(app)
      .get("/car/cities")
      .set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });


  test("Test Post duplicate Car", async () => {
    const response = await request(app)
      .post("/car")
      .set("Authorization", "JWT " + accessToken)
      .send(car);
    expect(response.statusCode).toBe(409);
  });

  test("Test PUT /car/:id", async () => {
    const updatedCar = { ...car, price: 35000 };
    const response = await request(app)
      .put(`/car/${car._id}`)
      .set("Authorization", "JWT " + accessToken)
      .send(updatedCar);
    expect(response.statusCode).toBe(200);
    expect(response.body.price).toBe(updatedCar.price);
  });

  test("Test DELETE /car/:id", async () => {
    const response = await request(app)
      .delete(`/car/${car._id}`)
      .set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
  });


  
});
