import express, { Request, Response } from "express";
import serverlessHttp from "serverless-http";
import cors from "cors";
import { getUser } from "./lib";
import { decodeJwtToken } from "../../utils";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.options("*");

app.get("/user/me", async (req: Request, res: Response) => {
  try {
    let userSub = decodeJwtToken(req.headers.authorization!);
    let user = await getUser(userSub);
    res.json(user);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

export const handler = serverlessHttp(app);

export { app as userApp };
