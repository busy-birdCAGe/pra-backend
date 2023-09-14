import express, { Request, Response } from "express";
import serverlessHttp from "serverless-http";
import cors from "cors";
import { createPrayee, deletePrayee, getPrayerList } from "./lib";
import { RequestView } from "../../database";
import { decodeJwtToken } from "../../utils";
import { successMessages } from "../../constants";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.options("*");

app.post("/prayee", async (req: Request, res: Response) => {
  try {
    let userSub = decodeJwtToken(req.headers.authorization!);
    let requestId = parseInt(req.query.requestId!.toString());
    await createPrayee(userSub, requestId);
    res.send(successMessages.general);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

app.delete("/prayee", async (req: Request, res: Response) => {
  try {
    let userSub = decodeJwtToken(req.headers.authorization!);
    let requestId = parseInt(req.query.requestId!.toString());
    await deletePrayee(userSub, requestId);
    res.send(successMessages.general);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

//Prayer list

const handler = serverlessHttp(app);

export { handler };

export { app as requestsApp };
