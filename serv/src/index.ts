import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { router } from "./candidates/endpoints.router";

dotenv.config();

envVarValidation();

const HOST = process.env.HOST;
const PORT: number = parseInt(process.env.PORT as string, 10);
const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

 app.listen(PORT, () => {
    console.log(`Listening on: ${HOST}:${PORT}`);
  });


function envVarValidation() {
   let reqEnvVars: string[] = ['HOST', 'PORT', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME'];
   let terminate = false;
   for (var reqVar of reqEnvVars) {
      if (reqVar in process.env) {
            if (process.env[reqVar] == '') {
               console.log(`Mandatory environment parameter ${reqVar} not assigned with value in .env file`);
               terminate = true;
            }
      } else {
         console.log(`Mandatory environment parameter ${reqVar} not defined in .env file`);
         terminate = true; 
      }
   }
   if (terminate) {
      process.exit(1);
   } 
}
