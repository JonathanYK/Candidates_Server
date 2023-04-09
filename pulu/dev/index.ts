import * as pulumi from "@pulumi/pulumi"
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker";
import * as childProcess from 'child_process';

const availabilityZoneA: string = "us-east-1a";
const availabilityZoneB: string = "us-east-1b";

const availabilityZoneRDSc: string = "us-east-1c";
const availabilityZoneRDSd: string = "us-east-1d";


// candidate main VPC
const candVpc = new aws.ec2.Vpc("cand-vpc", {
    cidrBlock: "10.0.0.0/16",
    tags: {
      Name: "cand-vpc"
    }
});
export const candVpcId = candVpc.id;

// candidate main internet gw
const vpcGw = new aws.ec2.InternetGateway("cand-vpc-gw", {
  vpcId: candVpc.id,
  tags: {
    Name: "cand-vpc-gw"
  },
});
export const vpcGwId = vpcGw.id;



// at the END- change to specific ips and ports
// candidate main security group
const candSg = new aws.ec2.SecurityGroup("cand-security-group", {
  vpcId: candVpc.id,

  ingress: [{
    protocol: "-1",
    fromPort: 0,
    toPort: 0,
    cidrBlocks: ["0.0.0.0/0"],

  }],
  egress: [{
      fromPort: 0,
      toPort: 0,
      protocol: "-1",
      cidrBlocks: ["0.0.0.0/0"],
  }],
  tags: {
    Name: "cand-sg"
  },
});
export const candSgId = candSg.id;

// candidate main eip
const candEip = new aws.ec2.Eip("cand-eip-nat", {
  vpc: true,
  tags: {
    Name: "cand-eip-nat"
  }
});
export const candEipId = candEip.id;

// candidate public subnet 1
const candPublicSubnet1 = new aws.ec2.Subnet("cand-pub-subnet-1", {
  vpcId: candVpc.id,
  cidrBlock: "10.0.1.0/24",
  availabilityZone: availabilityZoneA,
  mapPublicIpOnLaunch: true,
  tags: {
    Name: "cand-pub-subnet-1"
  }
});
export const candPublicSubnet1Id = candPublicSubnet1.id;

// candidate public subnet 2
const candPublicSubnet2 = new aws.ec2.Subnet("cand-pub-subnet-2", {
  vpcId: candVpc.id,
  cidrBlock: "10.0.2.0/24",
  availabilityZone: availabilityZoneB,
  mapPublicIpOnLaunch: true,
  tags: {
      Name: "cand-pub-subnet-2"
  }
});
export const candPublicSubnet2Id = candPublicSubnet2.id;


// Route table for public subnets
const candPublicRouteTable = new aws.ec2.RouteTable("cand-publ-routetable", {
  vpcId: candVpc.id,
  tags: {
      Name: "cand-publ-routetable"
  }
});
export const candPublicRouteTableId = candPublicRouteTable.id;


// Route to the Internet Gateway for public subnets
const publicRoute = new aws.ec2.Route("public-route", {
  routeTableId: candPublicRouteTable.id,
  destinationCidrBlock: "0.0.0.0/0",
  gatewayId: vpcGw.id,
});
export const publicRouteId = publicRoute.id;


// Associate candPublicSubnet1 with the public route table
const publicSubnetAssociationSub1 = new aws.ec2.RouteTableAssociation("cand-publ-subnet-1-routetable-association", {
  subnetId: candPublicSubnet1.id,
  routeTableId: candPublicRouteTable.id,
});
export const publicSubnetAssociationSub1Id = publicSubnetAssociationSub1.id;


// Associate candPublicSubnet2 with the public route table
const publicSubnetAssociationSub2 = new aws.ec2.RouteTableAssociation("cand-publ-subnet-2-routetable-association", {
  subnetId: candPublicSubnet2.id,
  routeTableId: candPublicRouteTable.id,
});
export const publicSubnetAssociationSub2Id = publicSubnetAssociationSub2.id;


// candidate private subnet 1
const candPrivateSubnet1 = new aws.ec2.Subnet("cand-priv-subnet-1", {
  vpcId: candVpc.id,
  cidrBlock: "10.0.8.0/24",
  availabilityZone: availabilityZoneA,
  tags: {
      Name: "cand-priv-subnet-1"
  }
});
export const candPrivateSubnet1Id = candPrivateSubnet1.id;


// candidate private subnet 2
const candPrivateSubnet2 = new aws.ec2.Subnet("cand-priv-subnet-2", {
  vpcId: candVpc.id,
  cidrBlock: "10.0.9.0/24",
  availabilityZone: availabilityZoneA,
  tags: {
      Name: "cand-priv-subnet-2"
  },
});
export const candPrivateSubnet2Id = candPrivateSubnet2.id;


// route table for private subnets
const candPrivateRouteTable = new aws.ec2.RouteTable("cand-priv-routetable", {
  vpcId: candVpc.id,
  tags: {
      Name: "cand-priv-routetable"
  }
});
export const candPrivateRouteTableId = candPrivateRouteTable.id;

// associate candPrivateSubnet1 to private route table
new aws.ec2.RouteTableAssociation("cand-priv-subnet-1-routetable-association", {
  subnetId: candPrivateSubnet1.id,
  routeTableId: candPrivateRouteTable.id,
});


// associate candPrivateSubnet2 to private route table
new aws.ec2.RouteTableAssociation("cand-priv-subnet-2-routetable-association", {
  subnetId: candPrivateSubnet2.id,
  routeTableId: candPrivateRouteTable.id,
});


// nat gw for private subnet 1
const candNatGatewayPrivSub1 = new aws.ec2.NatGateway("cand-nat-gw-priv-subnet-1", {
  subnetId: candPrivateSubnet1.id,
  allocationId: candEip.id,
  tags: {
    Name: "cand-nat-gw-priv-subnet-1"
  }
});
export const candNatGatewayPrivSub1Id = candNatGatewayPrivSub1.id;


// RDS resources
// rds public subnet 1
const candRDSPublicSubnet1 = new aws.ec2.Subnet("cand-rds-pub-subnet1", {
  vpcId: candVpc.id,
  cidrBlock: "10.0.11.0/24",
  availabilityZone: availabilityZoneRDSc,
  mapPublicIpOnLaunch: true,
  tags: {
    Name: "cand-rds-pub-subnet1"
  }
});
export const candRDSPublicSubnet1Id = candRDSPublicSubnet1.id;

// rds public subnet 2
const candRDSPublicSubnet2 = new aws.ec2.Subnet("cand-rds-pub-subnet2", {
  vpcId: candVpc.id,
  cidrBlock: "10.0.12.0/24",
  availabilityZone: availabilityZoneRDSd,
  mapPublicIpOnLaunch: true,
  tags: {
    Name: "cand-rds-pub-subnet2"
  }
});
export const candRDSPublicSubnet2Id = candRDSPublicSubnet2.id;


// Route table for public subnets
const candPublicRdsRouteTable = new aws.ec2.RouteTable("cand-publ-rds-routetable", {
  vpcId: candVpc.id,
  tags: {
      Name: "cand-publ-rds-routetable"
  }
});
export const candPublicRdsRouteTableId = candPublicRdsRouteTable.id;

// Route to the Internet Gateway for public subnets
const publicRouteRds = new aws.ec2.Route("public-route-rds", {
  routeTableId: candPublicRdsRouteTable.id,
  destinationCidrBlock: "0.0.0.0/0",
  gatewayId: vpcGw.id,
});
export const publicRouteRdsId = publicRouteRds.id;


// Associate candRDSPublicSubnet1 with the public route table
const publicSubnetAssociationSub1Rds = new aws.ec2.RouteTableAssociation("cand-publ-rds-subnet-1-routetable-association", {
  subnetId: candRDSPublicSubnet1.id,
  routeTableId: candPublicRdsRouteTable.id,
});
export const publicSubnetAssociationSub1RdsId = publicSubnetAssociationSub1Rds.id;

// Associate candRDSPublicSubnet2 with the public route table
const publicSubnetAssociationSub2Rds = new aws.ec2.RouteTableAssociation("cand-publ-rds-subnet-2-routetable-association", {
  subnetId: candRDSPublicSubnet2.id,
  routeTableId: candPublicRdsRouteTable.id,
});
export const publicSubnetAssociationSub2RdsId = publicSubnetAssociationSub2Rds.id;


// rds subnet group
const rdsSubnetGroup = new aws.rds.SubnetGroup("cand-rds-subnet-group", {
  subnetIds: [
    candRDSPublicSubnet1.id,
    candRDSPublicSubnet2.id,
  ],
  tags: {
      Name: "cand-rds-subnet-group",
  },
});
export const rdsSubnetGroupId = rdsSubnetGroup.id;


// rds PostgreSQL database instance
const pgInstance = new aws.rds.Instance("postgres-instance", {
  dbSubnetGroupName: rdsSubnetGroup.name,
  allocatedStorage: 20,
  engine: "postgres",
  engineVersion: "11.19",
  instanceClass: "db.t3.micro",
  dbName: "canddatabase",
  username: "postgres",
  password: "postgres", // from aws secrets
  publiclyAccessible: true,
  port: 5432,

  tags: {
    Name: "cand-postgres-instance"
  },
});
export const pgInstanceId = pgInstance.id;
// Output the endpoint URL for the instance
export const databaseEndpoint = pgInstance.endpoint;

// // Export the connection string
// //export const connectionString = pulumi.interpolate`postgres://${dbInstance.username}:${dbInstance.password}@${dbInstance.endpoint}/${dbInstance.name}`;

const rdsEndpoint = pgInstance.endpoint.apply(endpoint => endpoint);
const rdsPort = pgInstance.port.apply(port => port);
const rdsDbName = pgInstance.dbName.apply(dbName => dbName);
const rdsUsername = pgInstance.username.apply(username => username);
const rdsPassword = pgInstance.password.apply(password => password);

pulumi.all([rdsEndpoint, rdsPort, rdsDbName, rdsUsername, rdsPassword]).apply(([rdsEndpoint, rdsPort, rdsDbName, rdsUsername, rdsPassword]) => {
  const endpointArg = `${rdsEndpoint}`;
  const portArg = `${rdsPort}`;
  const rdsDbNameArg = `${rdsDbName}`;
  const rdsUsernameArg = `${rdsUsername}`;
  const rdsPasswordArg = `${rdsPassword}`;
  const args = [endpointArg, portArg, rdsDbNameArg, rdsUsernameArg, rdsPasswordArg];

  const initUsersScriptPath = '../initUsersTable.py';
  const initUsersScriptName = initUsersScriptPath.substring(initUsersScriptPath.lastIndexOf("/") + 1);
  const process = childProcess.spawn('python', [initUsersScriptPath, ...args]);

  process.stdout.on('data', (initUserScriptData: string) => {
    console.log(`Executing ${initUsersScriptName}:`);
    console.log(`${initUserScriptData}`);
  });

  process.stderr.on('data', (initUserScriptData: string) => {
    console.log(`Executing ${initUsersScriptName} FAILED:`);
    console.error(`stderr: ${initUserScriptData}`);
  });
});


// ecr repository to store the Docker image.
const candRepository = new aws.ecr.Repository("my-repository", {forceDelete: true});
export const candRepositoryId = candRepository.id;

const candImageName = candRepository.repositoryUrl;
const candImgName = "cand-image";
const candImgVer = "v1.0.0"; 

// build and publish the container image.
const candImage = new docker.Image(candImgName, {
  build: {
    context: "../../serv",
  },
  imageName: pulumi.interpolate`${candImageName}:${candImgVer}`,
});

// export the base and specific version image name.
export const baseImageName = candImage.baseImageName;
export const fullImageName = candImage.imageName;

// cand fargate cluster
const candCluster = new aws.ecs.Cluster("cand-cluster", {
  tags: {
    Name: "cand-ecs-cluster"
  },
});

// cand application loadbalancer
const candLb = new aws.lb.LoadBalancer("cand-alb", {
  internal: false,
  subnets: [candPublicSubnet1.id, candPublicSubnet2.id],
  securityGroups: [candSg.id],
  tags: {
    Name: "cand-application-lb"
  },
});
export const candLbId = candLb.id;


// target group for candImg container
const candTG = new aws.lb.TargetGroup("cand-tg-8085", {
  port: 8085,
  protocol: "HTTP",
  targetType: "ip",
  
  vpcId: candVpc.id,
  tags: {
    Name: "cand-targetgroup-8085"
  },
});
export const candTGId = candTG.id;


// listener for port 8085
const candListener = new aws.lb.Listener("cand-listener-8085", {
  loadBalancerArn: candLb.arn,
  port: 8085,
  defaultActions: [
    {
      type: "forward",
      targetGroupArn: candTG.arn,
    },
  ],
  tags: {
    Name: "cand-listener-8085"
  },
});
export const candListenerId = candListener.id;


// unprotect resource (for force deletion)
const fargateServiceOptions: pulumi.ResourceOptions = {
  protect: false, // Set protect to false to unprotect the resource.
};


// cand fargate service
const candService = new awsx.ecs.FargateService("cand-fargate-service", {
    cluster: candCluster.arn,
    desiredCount: 1,
    
    networkConfiguration: {
      assignPublicIp: true,
      securityGroups: [candSg.id],
      subnets: [candPublicSubnet1.id, candPublicSubnet2.id],
  },
    
    taskDefinitionArgs: {
      containers: {

        // main cand container
        candImage: {
          name: candImgName,
          image: fullImageName,
          cpu: 256,
          memory: 128,
          environment: [{
            name: "DB_HOST",
            value: pgInstance.endpoint,
        }],
          portMappings: [{ 
            containerPort: 8085,
          }],
        },
      },
      
    },
    tags: {
      Name: "cand-fargate-service"
    },
}, fargateServiceOptions);
