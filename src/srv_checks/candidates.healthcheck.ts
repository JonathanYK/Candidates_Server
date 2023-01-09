import { HealthIndicator, ResourceHealth } from "./health-indicator";
import { AxiosResponse } from "axios";
import  axios from "axios";


export class CandidatesServiceHealthCheck extends HealthIndicator {
    name: string = 'Candidates Service Health Check';
  
    async checkHealth(): Promise<void> {
      let result: AxiosResponse<any>;
      try {
        const pingURL = `https://www.google.com/`;
        result = await axios(pingURL);
  
        // change accordingly to test db connection
        if (result.status === 200) {
          this.status = ResourceHealth.Healthy;
        } else {
          this.status = ResourceHealth.Unhealthy;
          this.details = `Received status: ${result.status}`;
        }
      } catch (e) {
        this.status = ResourceHealth.Unhealthy;
        this.details = e.message;
        console.log(`HEALTH: ${this.name} is unhealthy.`, e.message);
      }
    }
  }