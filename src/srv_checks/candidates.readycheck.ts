import { ReadyIndicator, ResourceReadiness } from "./ready-indicator";
import { AxiosResponse } from "axios";
import  axios from "axios";

export class CandidatesServiceReadyCheck extends ReadyIndicator {
    name: string = 'Candidates Service Ready Check';
  
    async checkReadiness(): Promise<void> {
      let result: AxiosResponse<any>;
      try {
        const pingURL = `https://www.google.com/`;
        result = await axios(pingURL);
  
        // change accordingly to test db connection
        if (result.status === 200) {
          this.status = ResourceReadiness.Ready;
        } else {
          this.status = ResourceReadiness.NotReady;
          this.details = `Received status: ${result.status}`;
        }
      } catch (e) {
        this.status = ResourceReadiness.NotReady;
        this.details = e.message;
        console.log(`READINESS: ${this.name} is not ready.`, e.message);
      }
    }
  }