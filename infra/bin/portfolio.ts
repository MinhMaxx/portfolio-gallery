#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PortfolioStack } from '../lib/portfolio-stack';

const app = new cdk.App();

new PortfolioStack(app, 'PortfolioStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-southeast-2',
  },
  domainName: 'bminhnguyen.dev',
  certificateArn: 'arn:aws:acm:us-east-1:061051255024:certificate/f9c0090a-d173-4af2-99a2-913b368b3291',
});
