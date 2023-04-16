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