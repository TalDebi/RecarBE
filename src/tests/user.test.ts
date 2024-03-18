import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
const { ObjectId } = require("mongodb");

let app: Express;
const user = {
  _id: new ObjectId(1234567),
  name: "test user",
  email: "testUser@test.com",
  password: "1234567890",
};

const postId = new ObjectId()

let accessToken;

beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await User.deleteMany({ email: user.email });
  const response = await request(app).post("/auth/register").send(user);
  user._id = response.body.user._id;
  accessToken = response.body.tokens.accessToken;
});

afterAll(async () => {
  await User.findByIdAndDelete(user._id);
  await mongoose.connection.close();
});

describe("User tests", () => {

  test("should add liked post for a valid user ID with authentication", async () => {
    const response = await request(app)
      .post(`/user/${user._id}/likedPosts`)
      .set("Authorization", `Bearer ${accessToken}`).send({_id:postId});
    expect(response.statusCode).toBe(200);
  });


  test("should return liked posts for a valid user ID with authentication", async () => {
    const response = await request(app)
      .get(`/user/${user._id}/likedPosts`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("likedPosts");
    expect(response.body.likedPosts).toBeInstanceOf(Array);
  });

  test("should delete liked post for a valid user ID with authentication", async () => {
    const response = await request(app)
      .delete(`/user/${user._id}/likedPosts/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toBe(200);
  });

  test("should return 404 for non-existing user ID with authentication", async () => {
    const nonExistingUserId = new ObjectId(1154567);
    const response = await request(app)
      .get(`/user/likedPosts/${nonExistingUserId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toBe(404);
  });

  test("should return 401 for unauthorized access without token", async () => {
    const response = await request(app).get(`/user/${user._id}/likedPosts`);
    expect(response.statusCode).toBe(401);
  });
  

  

  test("should return 401 for unauthorized access with invalid token", async () => {
    const response = await request(app)
      .get(`/user/likedPosts/${user._id}`)
      .set("Authorization", "Bearer INVALID_TOKEN");
    expect(response.statusCode).toBe(401);
  });
});
