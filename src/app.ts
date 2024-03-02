import env from "dotenv";
env.config();
import express, { Express } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import CarRoute from "./routes/car";
import PostRouter from "./routes/post"
import authRoute from "./routes/auth";
import fileRoute from "./routes/file_route";

const initApp = (): Promise<Express> => {
  const promise = new Promise<Express>((resolve) => {
    const db = mongoose.connection;
    db.once("open", () => console.log("Connected to Database"));
    db.on("error", (error) => console.error(error));
    const url = process.env.DB_URL;
    mongoose.connect(url).then(() => {
      const app = express();
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "*");
        res.header("Access-Control-Allow-Headers", "*");
        next();
      });
      app.use("/car", CarRoute);
      app.use("/auth", authRoute);
      app.use("/file", fileRoute);
      app.use("/post", PostRouter)
      app.use("/public", express.static("public"));
      resolve(app);
    });
  });
  return promise;
};

export default initApp;
