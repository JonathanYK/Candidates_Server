import e from "express";
import express, { Request, Response } from "express";
export const router = express.Router();
const { getClient } = require('./getClient');

// GET main page
router.get("/", async (e, res: Response, next) => { 
  try {
    res.send('<h2 style="color:DodgerBlue;"><i>Welcome to candidates main page!</i></h2>');
  
    } catch (e) {
      res.status(503).send(e.message);
    }
  });
  
// GET health check
router.get("/health", async (e, res: Response, next) => { 

  const healthcheckOk = {
    uptime: process.uptime(),
    status: 'HEALTHY',
    timestamp:  function () {var date = new Date(); 
                return ("00" + date.getDate()).slice(-2) + "/" +
                ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
                date.getFullYear() + " " +
                ("00" + date.getHours()).slice(-2) + ":" +
                ("00" + date.getMinutes()).slice(-2) + ":" +
                ("00" + date.getSeconds()).slice(-2);
                }()
    }
  try {
    res.send(healthcheckOk);
  
    } catch (e) {
      res.status(503).send(e.message);
    }
  });

// GET ready check
router.get("/ready", async (e, res: Response, next) => { 

  try {
    const client = await getClient();
    if (client._connected) {
      let retval: string  = "ready check passed!";
      await client.end();
      res.status(200).send(retval);
    }
  
    } catch (e) {
      res.status(400).send(`Cannot connect to Postgres db: ${e.message}`);
    }
  });


// GET all candidates
router.get("/all-candidates", async (e, res: Response, next) => {
  try {

    const retVal = await (async () => {
    const client = await getClient();
    const answer = await client.query(`select * from users`);
    await client.end();
    return answer.rows
    })();

    res.status(200).send(retVal)

  } catch (e) {
    res.status(500).send(e.message);
  }
});


// GET candidate by name
router.get("/candidate", async (req: Request, res: Response) => {
  try {

    const retVal = await (async () => {
      const client = await getClient();
      const answer = await client.query(`select * from users where candName='${req.query.candName}';`);
      await client.end();
          
      return answer.rows
    })();

    if (retVal == "") {
      return res.status(200).send(`Candidate with name '${req.query.candName}' not found!`)
    } else {
      res.status(200).send(retVal)
    }

  } catch (e) {
    res.status(500).send(e.message);
  }
});

// POST new entry of candidate
router.post("/candidate", async (req: Request, res: Response) => {
  try {

    const client = await getClient();
    await client.query('INSERT INTO users (candId, candName, candEmail) VALUES ($1, $2, $3)', [req.query.candId, req.query.candName, req.query.candEmail], (error: Error) => {
    if (error) {
      throw error
    }
    client.end();
    res.status(201).send(`Candidate added with ID: ${req.query.candId}`)

  });

  } catch (e) {
    res.status(500).send(e.message);
  }
});


// PUT candidates email
router.put("/candidate", async (req: Request, res: Response) => {
  
  try {
    const client = await getClient();

    await client.query( 'UPDATE users SET candEmail = $1 WHERE candId = $2',
    [req.query.candEmail, req.query.candId],
    
    (error: Error) => {
      if (error) {
        throw error
      }
      client.end();
      res.status(200).send(`Email changed for candidate with ID: ${req.query.candId}`)
  });

  } catch (e) {
    res.status(500).send(e.message);
  }
});


// DELETE candidate by id from db
router.delete("/candidate", async (req: Request, res: Response) => {
  try {

    const client = await getClient();
    await client.query( 'DELETE FROM users WHERE candId = $1', [req.query.candId],
    (error: Error) => {
      if (error) {
        throw error
      }
      client.end();
      res.status(200).send(`User modified with ID: ${req.query.candId}`)
  });

  } catch (e) {
    res.status(500).send(e.message);
  }
});