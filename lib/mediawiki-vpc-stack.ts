import * as cdk from "@aws-cdk/core";
import {SubnetType, Vpc} from "@aws-cdk/aws-ec2";

export class MediawikiVpcStack extends cdk.Stack
{
    public readonly vpc: Vpc;
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps)
    {
        super(scope, id, props);
        this.vpc = new Vpc(this, 'vpc',
            {
                cidr: "10.0.0.0/16",
                enableDnsHostnames: true,
                enableDnsSupport: true,
                maxAzs: 2,
                subnetConfiguration:  [
                    {
                        cidrMask: 24,
                        name: 'public',
                        subnetType: SubnetType.PUBLIC,
                    },
                    {
                        cidrMask: 24,
                        name: 'private',
                        subnetType: SubnetType.PRIVATE_WITH_NAT
                    }
                ]
            });
        new cdk.CfnOutput(this, "VPCId", {
            value: this.vpc.vpcId,
            description: "Mediawiki VPC ID",
            exportName: "sysint-mediawiki:vpcId"
        });
    }
}