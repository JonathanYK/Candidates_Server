/*
This file uses the AWS Secrets Manager to retrieve a secret named "pulumi-rds-secrets" (template method provided by AWS),
it saves it to a local file named "awsSecrets.json" and be later used by Pulumi to set the secrets.
It uses the "@aws-sdk/client-secrets-manager" library to interact with the AWS Secrets Manager
and the "fs" library to write the retrieved secret to a file.
*/

import { SecretsManagerClient, GetSecretValueCommand, } from "@aws-sdk/client-secrets-manager";
import * as fs from "fs";


// Define the file path and content
const filePath = "./awsSecrets.json";


// retrive secrets from aws secrets manager
const secret_name = "pulumi-rds-secrets";
const client = new SecretsManagerClient({
  region: "us-east-1",
});

async function retriveSercrets() {
    try {
      const response = await client.send(
        new GetSecretValueCommand({
          SecretId: secret_name,
        })
      );
  
  
    const secretJson = JSON.parse(response.SecretString?.toString() || "{}")
    if (secretJson == "{}") { 
      console.error("Failed to retrive secrets from aws secrets manager") 
      return secretJson
    } else {
      console.log("Retrived AWS secrets successfully!") 
      return secretJson
    }
    
    } catch (error) {
        throw error;
      }
  }

retriveSercrets().then((secretJson) => {
  const secretJsonIs = JSON.stringify(secretJson);
  // Write the secrets to a new file
    fs.writeFile(filePath, secretJsonIs, (err) => {
        if (err) throw err;
        console.log(`AWS secrets has been saved to ${filePath}`);
    });

});