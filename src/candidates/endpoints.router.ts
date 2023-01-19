import express, { Request, Response } from "express";
export const router = express.Router();
const { getClient } = require('./getClient');

// GET health check
router.get("/health", async (res: Response) => { 

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
router.get("/ready", async (res: Response) => { 

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
router.get("/all-candidates", async (res: Response) => {
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

    var reqName = req.query.name

    const aa = await (async () => {
      const client = await getClient();
      const answer = await client.query(`select * from users where name='${reqName}';`);
      await client.end();

      return answer.rows[0]
    })();

    res.status(200).send(aa)

  } catch (e) {
    res.status(500).send(e.message);
  }
});

// POST new entry of candidate
router.post("/candidate", async (req: Request, res: Response) => {
  try {

    var reqId = req.query.id
    var reqName = req.query.name
    var reqEmail = req.query.email

    const client = await getClient();
    await client.query('INSERT INTO users (id, name, email) VALUES ($1, $2, $3)', [reqId, reqName, reqEmail], (error: Error) => {
    if (error) {
      throw error
    }
    client.end();
    res.status(201).send(`User added with ID: ${reqId}`)

  });

  } catch (e) {
    res.status(500).send(e.message);
  }
});


// PUT candidates email
router.put("/candidate", async (req: Request, res: Response) => {
  try {

    var reqId = req.query.id
    var reqEmail = req.query.email

    const client = await getClient();

    await client.query( 'UPDATE users SET email = $1, WHERE id = $2',
    [reqEmail, reqId],
    (error: Error) => {
      if (error) {
        throw error
      }
      client.end();
      res.status(200).send(`email changed for user with ID: ${reqId}`)
  });

  } catch (e) {
    res.status(500).send(e.message);
  }
});


// DELETE candidate by id from db
router.delete("/candidate", async (req: Request, res: Response) => {
  try {

    var reqId = req.query.id

    const client = await getClient();
    await client.query( 'DELETE FROM users WHERE id = $1', [reqId],
    (error: Error) => {
      if (error) {
        throw error
      }
      client.end();
      res.status(200).send(`User modified with ID: ${reqId}`)
  });

  } catch (e) {
    res.status(500).send(e.message);
  }
});