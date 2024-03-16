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

beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await User.deleteMany({ email: user.email });
});

afterAll(async () => {
  await mongoose.connection.close();
});

let accessToken: string;
let refreshToken: string;
let newRefreshToken: string;

describe("Auth tests", () => {
  test("Test Register", async () => {
    const response = await request(app).post("/auth/register").send(user);
    expect(response.statusCode).toBe(201);
    user._id = response.body.user._id;
    expect(response.body.user.email).toBe(user.email);
    expect(response.body.user.name).toBe(user.name);
  });

  test("Test Register exist email", async () => {
    const response = await request(app).post("/auth/register").send(user);
    expect(response.statusCode).toBe(409);
  });

  test("Test Register missing password", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "test@test.com",
    });
    expect(response.statusCode).toBe(400);
  });

  test("Test Login", async () => {
    const response = await request(app).post("/auth/login").send(user);
    expect(response.statusCode).toBe(200);
    accessToken = response.body.tokens.accessToken;
    refreshToken = response.body.tokens.refreshToken;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  test("Test Login missing password", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ ...user, password: undefined });
    expect(response.statusCode).toBe(400);
  });

  test("Test for Invalid Credentials on Login", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "invalid@test.com", password: "invalidPassword" });
    expect(response.statusCode).toBe(401);
  });

  test("Test forbidden access without token", async () => {
    const response = await request(app).get("/car");
    expect(response.statusCode).toBe(401);
  });

  test("Test access with valid token", async () => {
    const response = await request(app)
      .get("/car")
      .set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
  });

  test("Test access with invalid token", async () => {
    const response = await request(app)
      .get("/car")
      .set("Authorization", "JWT 1" + accessToken);
    expect(response.statusCode).toBe(401);
  });

  test("Test unauthorized access without token", async () => {
    const response = await request(app)
      .put("/auth/someUserID")
      .send({ email: "test@test.com", password: "newPassword" });
    expect(response.statusCode).toBe(401);
  });

  test("Test refresh token", async () => {
    const response = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "JWT " + refreshToken)
      .send();
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();

    const newAccessToken = response.body.accessToken;
    newRefreshToken = response.body.refreshToken;

    const response2 = await request(app)
      .get("/car")
      .set("Authorization", "JWT " + newAccessToken);
    expect(response2.statusCode).toBe(200);
  });

  test("Test double use of refresh token", async () => {
    const response = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "JWT " + refreshToken)
      .send();
    expect(response.statusCode).toBe(401);

    const response1 = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "JWT " + newRefreshToken)
      .send();
    expect(response1.statusCode).toBe(401);
  });

  test("Test for Invalid Refresh Token", async () => {
    const response = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "JWT invalidRefreshToken")
      .send();
    expect(response.statusCode).toBe(401);
  });

  test("Test for missing Refresh Token", async () => {
    const response = await request(app).get("/auth/refresh").send();
    expect(response.statusCode).toBe(400);
  });

  test("Test for Expired Refresh Token", async () => {
    // Simulate an expired refresh token
    const expiredRefreshToken = jwt.sign(
      { _id: "user_id" },
      "expired_refresh_secret",
      { expiresIn: "-1s" }
    );

    const response = await request(app)
      .get("/auth/refresh")
      .set("Authorization", `JWT ${expiredRefreshToken}`)
      .send();
    expect(response.statusCode).toBe(401);
  });

  test("Test for Missing Authorization Header", async () => {
    const response = await request(app).get("/car");
    expect(response.statusCode).toBe(401);
  });

  test("Test for Incorrect Authorization Header Format", async () => {
    const response = await request(app)
      .get("/car")
      .set("Authorization", "InvalidTokenFormat");
    expect(response.statusCode).toBe(401);
  });

  test("Test user update", async () => {
    const response = await request(app)
      .put(`/auth/${user._id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ ...user, name: "Updated Name" });
    expect(response.statusCode).toBe(200);
    user._id = response.body._id;
    expect(response.body.email).toBe(user.email);
    expect(response.body.name).toBe("Updated Name");
  });

  test("Test user update with missing fields", async () => {
    const response = await request(app)
      .put(`/auth/${user._id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Updated Name2" });
    expect(response.statusCode).toBe(400);
  });

  test("Test user update with existing email", async () => {
    const response = await request(app)
      .put(`/auth/${user._id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        email: "testUser2@test.com",
        password: "newPassword",
        _id: user._id,
        name: "testUser",
      });
    expect(response.statusCode).toBe(409);
  });

  test("Test user update with incorrect user ID", async () => {
    const response = await request(app)
      .put(`/auth/${new ObjectId(1234561)}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        email: "testUser2@test.com",
        password: "newPassword",
        _id: user._id,
        name: "testUser",
      });
    expect(response.statusCode).toBe(404);
  });

  test("Test Logout", async () => {
    const loginResponse = await request(app).post("/auth/login").send(user);
    expect(loginResponse.statusCode).toBe(200);
    const accessToken = loginResponse.body.tokens.accessToken;
    const refreshToken = loginResponse.body.tokens.refreshToken;

    const logoutResponse = await request(app)
      .get("/auth/logout")
      .set("Authorization", `Bearer ${refreshToken}`);
    expect(logoutResponse.statusCode).toBe(200);
  });

  test("Test Logout without Refresh Token", async () => {
    const logoutResponse = await request(app).get("/auth/logout");
    expect(logoutResponse.statusCode).toBe(401);
  });

  test("Test Logout with Invalid Refresh Token", async () => {
    const invalidToken = "invalid_token";
    const logoutResponse = await request(app)
      .get("/auth/logout")
      .set("Authorization", `Bearer ${invalidToken}`);
    expect(logoutResponse.statusCode).toBe(401);
  });

  test("Test Logout after Logout", async () => {
    const loginResponse = await request(app).post("/auth/login").send(user);
    expect(loginResponse.statusCode).toBe(200);
    const refreshToken = loginResponse.body.tokens.refreshToken;

    const logoutResponse = await request(app)
      .get("/auth/logout")
      .set("Authorization", `Bearer ${refreshToken}`);
    expect(logoutResponse.statusCode).toBe(200);

    const logoutAgainResponse = await request(app)
      .get("/auth/logout")
      .set("Authorization", `Bearer ${refreshToken}`);
    expect(logoutAgainResponse.statusCode).toBe(401);
  });
});
