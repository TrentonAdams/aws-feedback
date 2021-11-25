# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

# Deploying Stack

I haven't learned the proper way of passing variables/parameters to the stacks
yet, so I'm currently using env vars. I also have not added support for
importing an existing VPC or load balancer.
  
Once you've set up your environment for the CDK, this should just work.

```bash
# domain_name is the route53 zone portion of the domain name, not including host.
cdk bootstrap aws://account-id/us-west-2
time stack_name=slow-cf-test domain_name=example.com cdk deploy vpc ecs
curl http://wiki.exmaple.com
```

## Problem description for AWS feedback.

AWS cloudformation deploys are ultra slow. This isn't a CDK issue, it's a cloud
formation issue in general. There's no sane reason that this stack should take
8-9 minutes to fully deploy. I can see one minute for the vpc stack, and another
30s for the ECS stack, but no more than that. It's fairly obvious that AWS is
polling at various points in their infrastructure deployment management. But
honestly, those polling times need to be drastically reduced.

If the infrastructure can't handle it, AWS should fork out the coin to handle
the load. AWS is very expensive, and we ought to see significant benefits in
other areas, such as developer cycle times, to realize the benefit of using AWS.
But, the reality is, developer cycle times with the AWS platform are beyond
horrendous.

These slow cycle times dramatically increases the time it takes to learn. By the
time a stack deploy is complete, my attention is finished, and I'm off thinking
of something else.

All around this would benefit AWS adoption in general, and improve customer
satisfaction.