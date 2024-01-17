import express, { Request, Response } from "express";
import serverlessHttp from "serverless-http";
import cors from "cors";
import { successMessages } from "../../constants";
import { signUp, signIn } from "./lib";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.options("*");

app.post("/signup", async (req: Request, res: Response) => {
  try {
    let { userName, email, password } = req.body;
    await signUp(userName, email, password);
    res.send(successMessages.general);
  } catch (error: any) {
    console.error(error.stack);
    res.status(500).send(error.message);
  }
});

app.post("/signin", async (req: Request, res: Response) => {
  try {
    let { userName, email, password } = req.body;
    let tokens = await signIn(userName, email, password);
    res.send(tokens);
  } catch (error: any) {
    console.error(error.stack)
    res.status(500).send(error.message);
  }
});

app.get("/authorized", async (req: Request, res: Response) => {
  res.send("ok");
});

export const handler = serverlessHttp(app);

export { app as authApp };
