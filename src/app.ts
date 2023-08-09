import express, { Request, Response } from 'express';
import serverlessHttp from 'serverless-http';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello, world!' });
});

const handler = serverlessHttp(app);

export { handler };