import express from "express";
import { authApp } from "./src/services/auth/app"
import { requestsApp } from "./src/services/requests/app";

const mainApp = express();

mainApp.use("/", authApp);
mainApp.use("/", requestsApp);

const port = process.env.PORT || 3000;

mainApp.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



