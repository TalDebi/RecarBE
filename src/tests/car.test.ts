import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import CarModel, { Car } from "../models/car";
import { Express } from "express";
import User from "../models/user_model";

let app: Express;
let accessToken: string;
const user = {
  email: "testStudent@test.com",
  password: "1234567890",
};
beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await CarModel.deleteMany();

  User.deleteMany({ email: user.email });
  await request(app).post("/auth/register").send(user);
  const response = await request(app).post("/auth/login").send(user);
  accessToken = response.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.close();
});

const car: Car = {
  _id: "11111111",
  make: "toyota",
  model: "camry",
  year: 2010,
  price: 40000,
  hand: 2,
  color: "black",
  mileage: 100000,
  city: "Holon",
  owner: "1234567",
};

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
    expect(postedCar._id).toBe(car._id);
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

  test("Test Post duplicate Car", async () => {
    const response = await request(app)
      .post("/student")
      .set("Authorization", "JWT " + accessToken)
      .send(car);
    expect(response.statusCode).toBe(406);
  });

  test("Test PUT /car/:id", async () => {
    const updatedCar = { ...car, price: 35000 };
    const response = await request(app)
      .put(`/car/${car._id}`)
      .set("Authorization", "JWT " + accessToken)
      .send(updatedCar);
    expect(response.statusCode).toBe(201);
    expect(response.body.price).toBe(updatedCar.price);
  });

  test("Test DELETE /car/:id", async () => {
    const response = await request(app)
      .delete(`/car/${car._id}`)
      .set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(201);
  });
});
