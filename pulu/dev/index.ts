import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker";

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


// nat gw for private subnet 2
const candNatGatewayPrivSub2 = new aws.ec2.NatGateway("cand-nat-gw-priv-subnet-2", {
  subnetId: candPrivateSubnet2.id,
  allocationId: candEip.id,
  tags: {
    Name: "cand-nat-gw-priv-subnet-2"
  }
});
export const candNatGatewayPrivSub2Id = candNatGatewayPrivSub2.id;


// RDS resources
// rds public subnet 1
const candRDSPublicSubnet1 = new aws.ec2.Subnet("cand-rds-pub-subnet1", {
  vpcId: candVpc.id,
  cidrBlock: "10.0.11.0/24",
  availabilityZone: availabilityZoneRDSc,
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
  tags: {
    Name: "cand-rds-pub-subnet2"
  }
});
export const candRDSPublicSubnet2Id = candRDSPublicSubnet2.id;


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
  allocatedStorage: 5,
  engine: "postgres",
  engineVersion: "11.19",
  instanceClass: "db.t2.micro",
  name: "canddatabase",
  password: "mypassword", // from aws secrets
  username: "myusername",
  skipFinalSnapshot: true,
  tags: {
    Name: "cand-postgres-instance"
  },
});
export const pgInstanceId = pgInstance.id;
// Output the endpoint URL for the instance
export const databaseEndpoint = pgInstance.endpoint;

// // Export the connection string
// //export const connectionString = pulumi.interpolate`postgres://${dbInstance.username}:${dbInstance.password}@${dbInstance.endpoint}/${dbInstance.name}`;


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
export const candServiceId = candService.service.id;
