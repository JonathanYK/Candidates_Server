## Candidates Server: APIs and local execution

The Candidates Server is developed using Express.js framework and offers several APIs for accessing and managing candidate information stored in PostgreSQL.

Exposed APIs:
```
http://<IP>:<PORT>                                                                                         - main page with greeting
http://<IP>:<PORT>/health                                                                                  - GET health check.
http://<IP>:<PORT>/ready                                                                                   - GET ready check.
http://<IP>:<PORT>/all-candidates                                                                          - GET all candidates in AWS PostgreSQL RDS.
http://<IP>:<PORT>/candidate?candName=<candidate name>                                                     - GET specific candidate by its name.
http://<IP>:<PORT>/candidate?candId=<candidate id>&candName=<candidate name>&candEmail=<candidate email>   - POST new candidate to AWS PostgreSQL RDS.
http://<IP>:<PORT>/candidate?candId=<candidate id>&candEmail=<new candidate email>                         - PUT (replace) candidate email by candidate id.
http://<IP>:<PORT>/candidate?candId=<candidate id>                                                         - DELETE candidate by its id.


Dockerized execution:
IP:	localhost
PORT:	3001

Cloud deployment execution:
IP:	<candImage public IP>
PORT:	8085
```

To execute the server locally, it can be run as a standalone container according to .Dockerfile or using docker-compose to create both the server and PostgreSQL container. Pull `part1` branch and build/compose with local environment variables already defined in `.env`.


$~~~$

## Candidates Cloud Deployment: Create and sync cloud infrastructe using Pulumi

**Two Pulumi Stacks Available for Deployment:**
1. `dev` - [Candidates_Server/pulu/dev](https://github.com/JonathanYK/Candidates_Server/tree/part2pulu/pulu/dev) will be deployed on `us-east-1` region.
2. `prod` - [Candidates_Server/pulu/prod](https://github.com/JonathanYK/Candidates_Server/tree/part2pulu/pulu/prod) will be deployed on `us-west-2` region.

```
AWS credentials configuration:
          aws configure set aws_access_key_id ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws configure set aws_secret_access_key ${{ secrets.AWS_ACCESS_KEY }}
          aws configure set default.region "${{ env.AWS_REGION }}"

Docker authentication with ECR:
          aws ecr get-login-password --region ${{ env.AWS_REGION }} | docker login --username ${{ secrets.AWS_ACCOUNT_USERNAME }} --password-stdin ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ env.AWS_REGION }}.amazonaws.com/${{ env.DEV_REPO_NAME }}
          
```
**Deploying both stacks using the command `pulumi up -s <stack name>` after installing Pulumi, configuring AWS credentials, and authenticating Docker with ECR**
- Any push or pull request to branches other than `main` will trigger [pulumi_dev_deployment action](https://github.com/JonathanYK/Candidates_Server/blob/part2pulu/.github/workflows/pulumi_dev_deployment.yml)
- While any push or pull request directly to `main` branch will trigger aaa [pulumi_prod_deployment action](https://github.com/JonathanYK/Candidates_Server/blob/part2pulu/.github/workflows/pulumi_prod_deployment.yml)

$~~~$

## Infrastructure Visualization of `dev` or `prod` stacks

![AWS_Infra_Visualization](https://github.com/JonathanYK/Candidates_Server/blob/part2pulu/pulu/AWS_Infra_Visualization.png?raw=true)

Elaborate explanation of requirements can be found [Here](https://github.com/JonathanYK/Candidates_Server/blob/main/Candidates_Server_Spec.pdf/).
