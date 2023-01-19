import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { router } from "./candidates/endpoints.router";

dotenv.config();

// HOST and POST must be defined
if (!process.env.PORT || !process.env.HOST) {
   process.exit(1);
}
const HOST = process.env.HOST;
const PORT: number = parseInt(process.env.PORT as string, 10);
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(router);

 app.listen(PORT, () => {
    console.log(`Listening on: ${HOST}:${PORT}`);
  });