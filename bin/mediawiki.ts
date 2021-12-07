#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {MediawikiVpcStack} from "../lib/mediawiki-vpc-stack";
import {MediawikiEcsStack} from "../lib/mediawiki-ecs-stack";

const app = new cdk.App();

let stackName = process.env.stack_name||'ecs-test';
function createStackName(slug: string)
{
    return `${stackName}-${slug}`;
}

// TODO: 2021-11-25 tag:tags add AU tags
let defaultEnv = {
    account: process.env.CDK_DEPLOY_ACCOUNT ||
        process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
};
let vpcStack = new MediawikiVpcStack(app, createStackName('vpc'), {
    stackName: createStackName('vpc'),
    env: defaultEnv

})

let ecsStack = new MediawikiEcsStack(app, createStackName('ecs'), {
    stackName: createStackName('ecs'),
    smw_vpc: vpcStack.vpc,
    domainName: process.env.domain_name,
    env: defaultEnv
})
ecsStack.addDependency(vpcStack)

app.synth()