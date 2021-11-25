import * as cdk from '@aws-cdk/core';
import {
    Construct,
    NestedStack
} from '@aws-cdk/core';
import * as rds from "@aws-cdk/aws-rds";
import * as ec2 from "@aws-cdk/aws-ec2";
import {DatabaseInstance} from "@aws-cdk/aws-rds";
import {Vpc} from "@aws-cdk/aws-ec2";

interface MediawikiVpcStackProps {
    smw_vpc: Vpc
}

export class MediawikiRdsStack extends NestedStack
{
    public readonly dbInstance: DatabaseInstance;

    constructor(scope: Construct, id: string, props: MediawikiVpcStackProps)
    {
        super(scope, id);

        this.dbInstance = new rds.DatabaseInstance(this, 'db-instance', {
            vpc: props.smw_vpc,
            instanceIdentifier: 'sysint-waas-mediawiki',
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
            },
            engine: rds.DatabaseInstanceEngine.mariaDb({
                version: rds.MariaDbEngineVersion.VER_10_5_12,
            }),
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.BURSTABLE3,
                ec2.InstanceSize.MICRO,
            ),
            credentials: rds.Credentials.fromGeneratedSecret('root'),
            multiAz: false,
            allocatedStorage: 100,
            maxAllocatedStorage: 200,
            allowMajorVersionUpgrade: false,
            autoMinorVersionUpgrade: true,
            backupRetention: cdk.Duration.days(30),
            deleteAutomatedBackups: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            deletionProtection: false,
            databaseName: 'waas_wiki2',
            publiclyAccessible: false,
        });
    }
}
