/**
 * Required External Modules and Interfaces
 */
import express, { Request, Response } from "express";
import { CandidatesServiceHealthCheck } from "./candidates.healthcheck"
import { CandidatesServiceReadyCheck } from "./candidates.readycheck"


/**
 * Router Definition
 */
export const srvChecksRouter = express.Router();

/**
 * Controller Definitions
 */

// GET testStr
srvChecksRouter.get("/testStr", async (req: Request, res: Response) => {
    try {
        res.status(200).send("string for test basic api")
  
    } catch (e) {
      res.status(500).send(e.message);
    }
  });


// GET testStr
srvChecksRouter.get("/health", async (req: Request, res: Response) => {
  try {

      // shlould finish after db creation
      const candidatesServiceHealthCheck = new CandidatesServiceHealthCheck()

      candidatesServiceHealthCheck.checkHealth()

      res.status(200).send("health check finished!")
      

  } catch (e) {
    res.status(500).send(e.message);
  }
});

// GET testStr
srvChecksRouter.get("/ready", async (req: Request, res: Response) => {
  try {

      
      const candidatesServiceReadyCheck = new CandidatesServiceReadyCheck()

      candidatesServiceReadyCheck.checkReadiness()

      res.status(200).send("ready check finished!")
      

  } catch (e) {
    res.status(500).send(e.message);
  }
});

// GET items/:id

// POST items

// PUT items/:id

// DELETE items/:id