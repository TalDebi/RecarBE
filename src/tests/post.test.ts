import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import CarModel, { Car } from "../models/car";
import { Express } from "express";
import User from "../models/user";
import PostModel, { Post } from "../models/post";

let objects_to_delete = []


let app: Express;
let accessToken: string;
let user = {
  email: "testStudent@test.com",
  password: "1234567890",
  name: "Testy",
};
const car: Car = {
  _id: "65da55c45ddd0693dd576dd7",
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
beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await PostModel.deleteMany();

  User.deleteMany({ email: user.email });
  const response1 = await request(app).post("/auth/register").send(user);
  await (await request(app).post("/car").send(car)).body._id
  user['_id'] = response1.body._id
  objects_to_delete.push({ "model": User, "id": user['_id'] })
  const response = await request(app).post("/auth/login").send(user);
  accessToken = response.body.accessToken;
});

afterAll(async () => {
  await User.deleteOne({ _id: user["_id"] })
  await mongoose.connection.close();
});

const post: Post = {
  _id: "65da55c45ddd0693dd576dd7",
  publisher: user["_id"],
  car: car._id as string,
};

describe("Post tests", () => {

  // test("Test Get All Cars - empty response", async () => {
  //   const response = await request(app)
  //     .get("/car")
  //     .set("Authorization", "JWT " + accessToken);
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body).toStrictEqual([]);
  // });

  test("Test Post post", async () => {
    const response = await request(app)
      .post("/post")
      .set("Authorization", "JWT " + accessToken)
      .send(post);
    expect(response.statusCode).toBe(201);
    objects_to_delete.push({ "model": PostModel, "id": post._id })
  });

  test("Test Get All posts with one post in DB", async () => {
    const response = await request(app)
      .get("/post")
      .set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    const reciviedPost = response.body[0];
    expect(reciviedPost._id).toBe(post._id)
    expect(reciviedPost.comments.length).toBe(0)
    expect(reciviedPost.publisher).toBe(user["_id"])
    expect(reciviedPost.car).toBe(post.car)
  });

  test("Test Post duplicate post", async () => {
    const response = await request(app)
      .post("/post")
      .set("Authorization", "JWT " + accessToken)
      .send(post);
    expect(response.statusCode).toBe(409);
  });

  test("Test PUT /post/:id", async () => {
    const updatedCar = { ...car, price: 35000 };
    const response = await request(app)
      .put(`/car/${car._id}`)
      .set("Authorization", "JWT " + accessToken)
      .send(updatedCar);
    expect(response.statusCode).toBe(200);
    expect(response.body.price).toBe(updatedCar.price);
  });

  // test("Test DELETE /car/:id", async () => {
  //   const response = await request(app)
  //     .delete(`/car/${car._id}`)
  //     .set("Authorization", "JWT " + accessToken);
  //   expect(response.statusCode).toBe(200);
  // });
});
