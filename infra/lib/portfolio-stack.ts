import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import { Construct } from "constructs";

interface PortfolioStackProps extends cdk.StackProps {
  domainName: string;
}

export class PortfolioStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PortfolioStackProps) {
    super(scope, id, props);

    // ──────────────────────────────────────────────
    // S3: Frontend static assets
    // ──────────────────────────────────────────────
    const frontendBucket = new s3.Bucket(this, "FrontendBucket", {
      bucketName: `${props.domainName}-frontend`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // ──────────────────────────────────────────────
    // S3: Image storage (photos + work screenshots)
    // ──────────────────────────────────────────────
    const imagesBucket = new s3.Bucket(this, "ImagesBucket", {
      bucketName: `${props.domainName}-images`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [
        {
          allowedHeaders: ["*"],
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedOrigins: [
            `https://${props.domainName}`,
            "http://localhost:5173",
          ],
          maxAge: 3600,
        },
      ],
    });

    // ──────────────────────────────────────────────
    // Lambda: Thumbnail generator (triggered by S3)
    // ──────────────────────────────────────────────
    const thumbnailLambda = new lambda.Function(this, "ThumbnailGenerator", {
      functionName: "portfolio-thumbnail-generator",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("../.lambda-build/thumbnail-generator"),
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      environment: {
        IMAGES_BUCKET: imagesBucket.bucketName,
        THUMBNAIL_PREFIX: "thumbnails/",
      },
    });

    imagesBucket.grantRead(thumbnailLambda);
    imagesBucket.grantPut(thumbnailLambda);

    imagesBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(thumbnailLambda),
      { prefix: "photos/originals/" },
    );
    imagesBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(thumbnailLambda),
      { prefix: "work/originals/" },
    );

    // ──────────────────────────────────────────────
    // Lambda: Express API
    // ──────────────────────────────────────────────
    const apiLambda = new lambda.Function(this, "ApiLambda", {
      functionName: "portfolio-api",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "src/lambda.handler",
      code: lambda.Code.fromAsset("../.lambda-build/backend"),
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      environment: {
        NODE_ENV: "production",
        IMAGES_BUCKET: imagesBucket.bucketName,
      },
    });

    imagesBucket.grantReadWrite(apiLambda);
    imagesBucket.grantPut(apiLambda);

    // ──────────────────────────────────────────────
    // API Gateway
    // ──────────────────────────────────────────────
    const api = new apigateway.LambdaRestApi(this, "PortfolioApi", {
      restApiName: "portfolio-api",
      handler: apiLambda,
      proxy: true,
      deployOptions: {
        stageName: "prod",
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    // ──────────────────────────────────────────────
    // CloudFront: Single distribution, multiple origins
    // ──────────────────────────────────────────────
    const oai = new cloudfront.OriginAccessIdentity(this, "OAI");
    frontendBucket.grantRead(oai);
    imagesBucket.grantRead(oai);

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessIdentity(
          frontendBucket,
          {
            originAccessIdentity: oai,
          },
        ),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        "/api/*": {
          origin: new origins.RestApiOrigin(api),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          originRequestPolicy:
            cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
        "/images/*": {
          origin: origins.S3BucketOrigin.withOriginAccessIdentity(
            imagesBucket,
            {
              originAccessIdentity: oai,
            },
          ),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: new cloudfront.CachePolicy(this, "ImagesCachePolicy", {
            cachePolicyName: "portfolio-images-cache",
            defaultTtl: cdk.Duration.days(30),
            maxTtl: cdk.Duration.days(365),
            minTtl: cdk.Duration.days(1),
          }),
        },
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
      ],
    });

    // ──────────────────────────────────────────────
    // Outputs
    // ──────────────────────────────────────────────
    new cdk.CfnOutput(this, "CloudFrontURL", {
      value: `https://${distribution.distributionDomainName}`,
      description: "CloudFront distribution URL",
    });

    new cdk.CfnOutput(this, "CloudFrontDistributionId", {
      value: distribution.distributionId,
      description: "CloudFront distribution ID (for cache invalidation)",
    });

    new cdk.CfnOutput(this, "FrontendBucketName", {
      value: frontendBucket.bucketName,
      description: "S3 bucket for frontend assets",
    });

    new cdk.CfnOutput(this, "ImagesBucketName", {
      value: imagesBucket.bucketName,
      description: "S3 bucket for images",
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description: "API Gateway URL",
    });
  }
}
