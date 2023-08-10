import express, { Request, Response } from 'express';
import serverlessHttp from 'serverless-http';
import { port } from '../../constants';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello, world!!' });
});

const handler = serverlessHttp(app);

export { handler };

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});