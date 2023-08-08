import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { API } from "lambda-api";

const api = new API();

api.use((req, res, next) => {
  res.cors({ headers: "*", methods: "GET, POST, PATCH, OPTIONS" });
  next();
});

api.options("/*", (req, res) => {
  res.status(200).send({});
});

api.get("/", async (req, res) => {
  res.send({ data: true });
});

export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return await api.run(event, context);
};
