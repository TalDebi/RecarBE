import request from "supertest";
import initApp from "../app";
import mongoose, { Types } from "mongoose";
import CarModel from "../models/car";
import { Express } from "express";
import User from "../models/user";
import PostModel from "../models/post";
import CommentModel from "../models/comment";

let objects_to_delete = [];

let app: Express;
let accessToken: string;
let user = {
  email: "testStudent@test.com",
  password: "1234567890",
  name: "Testy",
};

beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await PostModel.deleteMany();

  User.deleteMany({ email: user.email });
  const response1 = await request(app).post("/auth/register").send(user);
  user["_id"] = response1.body.user._id;
  car["owner"] = user["_id"];
  post["car"] = car._id;
  await CarModel.create(car);
  objects_to_delete.push({ model: User, id: user["_id"] });
  objects_to_delete.push({ model: CarModel, id: car["_id"] });
  const response = await request(app).post("/auth/login").send(user);
  accessToken = response.body.tokens.accessToken;
});

afterAll(async () => {
  for (let document of objects_to_delete) {
    const oldDocument = await document.model.findById(document.id);
    oldDocument !== null && (await oldDocument.deleteOne());
  }
  await mongoose.connection.close();
});

const car = {
  _id: "65da55c45ddd0693dd576dd7",
  make: "toyota",
  model: "camry",
  year: 2010,
  price: 40000,
  hand: 2,
  color: "black",
  mileage: 100000,
  city: "Holon",
};

const post = {
  _id: "65da55c45ddd0693dd576dd7",
  car: car._id,
};

const comment = {
  text: "hey",
  _id: "65da55c45ddd0693dd576dd8",
};

const reply = {
  text: "Hey",
  _id: "65da55c45ddd0693dd576dd9",
};

describe("Post post tests", () => {
  test("Test Post post", async () => {
    const response = await request(app)
      .post("/post")
      .set("Authorization", "JWT " + accessToken)
      .send(post);
    expect(response.statusCode).toBe(201);
    objects_to_delete.push({ model: PostModel, id: post._id });
  });
  test("Test Post duplicate post", async () => {
    const response = await request(app)
      .post("/post")
      .set("Authorization", "JWT " + accessToken)
      .send(post);
    expect(response.statusCode).toBe(409);
  });

  test("Add comment to post", async () => {
    const response = await request(app)
      .post("/post/" + post._id + "/comment")
      .set("Authorization", "JWT " + accessToken)
      .send(comment);
    expect(response.statusCode).toBe(201);
    const recievedPost = response.body;
    expect(recievedPost._id).toBe(post._id);
    expect(recievedPost.comments.length).toBe(1);
    expect(recievedPost.comments[0]).toBe(comment._id);
  });

  test("Add reply to comment", async () => {
    const postRes = await request(app)
      .get("/post/" + post._id)
      .set("Authorization", "JWT " + accessToken);
    const response = await request(app)
      .post("/post/" + post._id + "/comment/" + comment["_id"] + "/reply")
      .set("Authorization", "JWT " + accessToken)
      .send(reply);
    expect(response.statusCode).toBe(201);
    const recievedComment = response.body;
    expect(recievedComment._id).toBe(comment._id);
    expect(recievedComment.replies.length).toBe(1);
    expect(recievedComment.replies[0]).toBe(reply._id);
    expect(recievedComment.publisher).toBe(user["_id"]);
  });
});

describe("Post get tests", () => {
  test("Test Get All posts with one post in DB", async () => {
    const response = await request(app)
      .get("/post")
      .set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    const recievedPost = response.body[0];
    expect(recievedPost._id).toBe(post._id);
    expect(recievedPost.publisher).toBe(user["_id"]);
    expect(recievedPost.car).toBe(String(post.car));
  });

  test("Test Get existing post by search", async () => {
    const response = await request(app)
      .get("/post")
      .query({
        make: ["toyota", "mazda"],
        year: { min: 1999 },
        hand: 2,
      })
      .set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    const recievedPost = response.body[0];
    expect(recievedPost._id).toBe(post._id);
    expect(recievedPost.comments.length).toBe(1);
    expect(recievedPost.publisher).toBe(user["_id"]);
    expect(recievedPost.car).toBe(String(post.car));
  });
  test("Test Get non-existing post by search", async () => {
    const response = await request(app)
      .get("/post")
      .query({
        make: ["toyota", "mazda"],
        year: { min: 1999 },
        hand: 2,
        color: "Green",
        psdf: 1,
      })
      .set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });
});

describe("Post put tests", () => {
  test("Test put diffrent car in post", async () => {
    const diffrentCar = "65da55c45ddd0003dd576eee";
    const response = await request(app)
      .put("/post/" + post._id)
      .set("Authorization", "JWT " + accessToken)
      .send({ ...post, car: diffrentCar, comments: [comment._id] });
    expect(response.statusCode).toBe(200);
    expect(response.body.car).toBe(diffrentCar);
  });

  test("Test put diffrent text in comment", async () => {
    const diffrentText = "esrt";
    const response = await request(app)
      .put("/post/" + post._id + "/comment/" + comment._id)
      .set("Authorization", "JWT " + accessToken)
      .send({ ...comment, text: diffrentText, comment: [reply._id] });
    expect(response.statusCode).toBe(200);
    expect(response.body.text).toBe(diffrentText);
  });

  test("Test put diffrent text in reply", async () => {
    const diffrentText = "65da55c45ddd0003dd576eee";
    const response = await request(app)
      .put(
        "/post/" + post._id + "/comment/" + comment._id + "/reply/" + reply._id
      )
      .set("Authorization", "JWT " + accessToken)
      .send({ ...reply, text: diffrentText });
    expect(response.statusCode).toBe(200);
    expect(response.body.text).toBe(diffrentText);
  });
});

describe("Post delete tests", () => {
  test("delete reply from comment", async () => {
    const response = await request(app)
      .delete(
        "/post/" + post._id + "/comment/" + comment._id + "/reply/" + reply._id
      )
      .set("Authorization", "JWT " + accessToken)
      .send();
    const oldObject = await CommentModel.findById(reply._id);
    expect(response.statusCode).toBe(200);
    expect(oldObject).toBe(null);
  });
  test("delete comment from post", async () => {
    const response = await request(app)
      .delete("/post/" + post._id + "/comment/" + comment._id)
      .set("Authorization", "JWT " + accessToken)
      .send();
    const oldObject = await CommentModel.findById(comment._id);
    expect(response.statusCode).toBe(200);
    expect(oldObject).toBe(null);
  });
  test("delete post", async () => {
    const response = await request(app)
      .delete("/post/" + post._id)
      .set("Authorization", "JWT " + accessToken)
      .send();
    const oldObject = await PostModel.findById(post._id);
    expect(response.statusCode).toBe(200);
    expect(oldObject).toBe(null);
  });
});
