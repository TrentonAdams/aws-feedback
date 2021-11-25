import * as cdk from '@aws-cdk/core';
import {BlockPublicAccess, Bucket} from "@aws-cdk/aws-s3";

export class MediawikiBucketStack extends cdk.Stack
{
    public readonly bucket: Bucket;

    constructor(scope: cdk.Construct, id: string, props: cdk.StackProps)
    {
        super(scope, id, props);

        this.bucket = new Bucket(this,
            'dbinit',
            {
                removalPolicy: cdk.RemovalPolicy.DESTROY,
                blockPublicAccess: BlockPublicAccess.BLOCK_ALL
            });
    }
}
