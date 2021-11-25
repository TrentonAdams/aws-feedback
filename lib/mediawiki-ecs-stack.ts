import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
import * as autoscaling from "@aws-cdk/aws-autoscaling";
import * as route53 from "@aws-cdk/aws-route53"
import * as route53Targets from "@aws-cdk/aws-route53-targets"
import {BlockPublicAccess, Bucket} from "@aws-cdk/aws-s3";

interface MediawikiVpcStackProps extends cdk.StackProps
{
    smw_vpc: ec2.Vpc,
    domainName?: string
}

export class MediawikiEcsStack extends cdk.Stack
{
    public cluster: ecs.Cluster;
    private bucket: Bucket;
    private domainName?: string;

    private autoScalingGroup: autoscaling.AutoScalingGroup;

    constructor(scope: cdk.Construct, id: string, props: MediawikiVpcStackProps)
    {
        super(scope, id, props);
        this.domainName = props.domainName;
        this.createBucket(props);
        this.createEcsCluster(props);
        this.createALB(props);
    }

    private createEcsCluster(props: MediawikiVpcStackProps)
    {
        this.cluster = new ecs.Cluster(this, 'Cluster', {
            vpc: props.smw_vpc,
        });

        // Add capacity to it
        this.autoScalingGroup = new autoscaling.AutoScalingGroup(this, 'ASG', {
            vpc: props.smw_vpc,
            instanceType: new ec2.InstanceType('t2.micro'),
            newInstancesProtectedFromScaleIn: false,
            machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
            minCapacity: 0,
            desiredCapacity: 1,
            maxCapacity: 2,
        });

        const capacityProvider = new ecs.AsgCapacityProvider(this,
            'AsgCapacityProvider', {
                autoScalingGroup: this.autoScalingGroup,
            });
        this.cluster.addAsgCapacityProvider(capacityProvider);

        const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDef');

        taskDefinition.addContainer('DefaultContainer', {
            image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
            memoryLimitMiB: 128,
            portMappings: [{hostPort: 80, containerPort: 80}]
        });

        // Instantiate an Amazon ECS Service
        const ecsService = new ecs.Ec2Service(this, 'Service', {
            cluster: this.cluster,
            taskDefinition,
        });
    }

    private createALB(props: MediawikiVpcStackProps)
    {
        const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
            vpc: props.smw_vpc,
            internetFacing: true,
            vpcSubnets: {subnets: props.smw_vpc.publicSubnets}
        });

        // Add a listener and open up the load balancer's security group
        // to the world.
        const listener = lb.addListener('Listener', {
            port: 80,

            // 'open: true' is the default, you can leave it out if you want.
            // Set it to 'false' and use `listener.connections` if you want to
            // be selective about who can access the load balancer.
            open: true,
        });

        // TODO: 2021-11-24 tag:alb import an existing load balancer instead?
        // TODO: 2021-11-24 tag:alb the "conditions" should work if we import
        //       an existing load balancer, as a load balance requires one
        //       default target.

        // Create an AutoScaling group and add it as a load balancing
        // target to the listener.
        listener.addTargets('ApplicationFleet', {
            port: 80,
            targets: [this.autoScalingGroup]
        });

        if (this.domainName)
        {
            let zone = route53.HostedZone.fromLookup(this, 'Zone',
                {domainName: this.domainName})
            let aRecord = new route53.ARecord(this, 'AliasRecord', {
                zone,
                recordName: 'wiki',
                target: route53.RecordTarget.fromAlias(
                    new route53Targets.LoadBalancerTarget(lb)),
            });
        }


    }

    private createBucket(props: MediawikiVpcStackProps)
    {
        this.bucket = new Bucket(this,
            'dbinit',
            {
                removalPolicy: cdk.RemovalPolicy.DESTROY,
                blockPublicAccess: BlockPublicAccess.BLOCK_ALL
            });

    }
}
