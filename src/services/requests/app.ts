import express, { Request, Response } from "express";
import serverlessHttp from "serverless-http";
import cors from "cors";
import { createRequest, getAllRequests, getRequestsByChurch } from "./lib";
import { RequestView } from "../../database";
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

app.post("/requests", async (req: Request, res: Response) => {
  try {
    let userSub = decodeJwtToken(req.headers.authorization!);
    let { text, churchIds, anonymous, personal } = req.body;
    let request = await createRequest(
      text,
      userSub,
      churchIds,
      anonymous,
      personal
    );
    res.json(request);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

app.get("/requests", async (req: Request, res: Response) => {
  try {
    let result: Array<RequestView>;
    let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
    let offset = req.query.offset ? parseInt(req.query.offset.toString()) : 0;
    if (req.query.churches) {
      let churches = req.query.churches!.toString().split(",");
      result = await getRequestsByChurch(churches, limit, offset);
    } else {
      result = await getAllRequests(limit, offset);
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

const handler = serverlessHttp(app);

export { handler };

export { app as requestsApp };
