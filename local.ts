import express from "express";
import { authApp } from "./src/services/auth/app"
import { requestsApp } from "./src/services/requests/app";
import { prayerApp } from "./src/services/prayer/app";
import { userApp } from "./src/services/user/app";

const mainApp = express();

mainApp.use("/", authApp);
mainApp.use("/", requestsApp);
mainApp.use("/", prayerApp);
mainApp.use("/", userApp);

const port = 3000;

mainApp.listen(port, () => {
  console.log(`PRA is running on port ${port}`);
});



