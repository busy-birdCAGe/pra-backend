import express, { Request, Response } from "express";
import serverlessHttp from "serverless-http";
import { successMessages, port } from "../../constants";
import { createUser } from "./lib";

const app = express();

app.use(express.json());

app.post("/signup", async (req: Request, res: Response) => {
  try {
    let { userName, email, password } = req.body;
    await createUser(userName, email, password);
    res.send(successMessages.general);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

const handler = serverlessHttp(app);

export { handler };

app.listen(port, () => {
  console.log(`Auth service listening on port ${port}`);
});
