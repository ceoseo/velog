import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'

import { withPrefix } from '../lib/prefix'
import { ecsTaskExecutionRole } from './iam'
import { ENV } from '../env'
import { SecurityGroup } from '@pulumi/aws/ec2'
import { TargetGroup } from '@pulumi/aws/alb'
import { PackageType } from '../type'
import { portMapper } from '../lib/portMapper'
import { ecsOption } from '../lib/ecsOptions'

export const createECSfargateService = ({
  image,
  subnetIds,
  taskSecurityGroup,
  defaultSecurityGroupId,
  targetGroup,
  packageType,
}: CreateECSFargateParams) => {
  const option = ecsOption[packageType]
  const cluster = new aws.ecs.Cluster(withPrefix(`${packageType}-cluster`))

  const port = portMapper[packageType]

  const service = new awsx.ecs.FargateService(withPrefix(`${packageType}-fargate-service`), {
    cluster: cluster.arn,
    desiredCount: option.desiredCount,
    networkConfiguration: {
      assignPublicIp: true,
      securityGroups: [defaultSecurityGroupId, taskSecurityGroup.id],
      subnets: subnetIds,
    },
    taskDefinitionArgs: {
      executionRole: {
        roleArn: ecsTaskExecutionRole.arn,
      },
      container: {
        image: image.imageUri,
        cpu: option.cpu,
        memory: option.memory,
        essential: true,
        portMappings: [{ targetGroup: targetGroup }],
        environment: [
          {
            name: 'PORT',
            value: port.toString(),
          },
          {
            name: 'APP_ENV',
            value: ENV.appEnv,
          },
          {
            name: 'NODE_ENV',
            value: ENV.isProduction ? 'production' : 'development',
          },
          {
            name: 'AWS_ACCESS_KEY_ID',
            value: ENV.awsAccessKeyId,
          },
          {
            name: 'AWS_SECRET_ACCESS_KEY',
            value: ENV.awsSecretAccessKey,
          },
        ],
      },
    },
  })

  const resourceId = service.service.id.apply((t) => t.split(':').at(-1)!)
  const ecsTarget = new aws.appautoscaling.Target(withPrefix(`${packageType}-ecs-target`), {
    maxCapacity: option.maxCapacity,
    minCapacity: option.minCapacity,
    resourceId: resourceId,
    scalableDimension: 'ecs:service:DesiredCount',
    serviceNamespace: 'ecs',
  })

  const ecsCPUPolicy = new aws.appautoscaling.Policy(withPrefix(`${packageType}-ecs-cpu-policy`), {
    policyType: 'TargetTrackingScaling',
    resourceId: ecsTarget.resourceId,
    scalableDimension: ecsTarget.scalableDimension,
    serviceNamespace: ecsTarget.serviceNamespace,
    targetTrackingScalingPolicyConfiguration: {
      predefinedMetricSpecification: {
        predefinedMetricType: 'ECSServiceAverageCPUUtilization',
      },
      targetValue: 50,
      scaleInCooldown: 60,
      scaleOutCooldown: 60,
    },
  })

  const ecsMemoryPolicy = new aws.appautoscaling.Policy(
    withPrefix(`${packageType}-ecs-memory-policy`),
    {
      policyType: 'TargetTrackingScaling',
      resourceId: ecsTarget.resourceId,
      scalableDimension: ecsTarget.scalableDimension,
      serviceNamespace: ecsTarget.serviceNamespace,
      targetTrackingScalingPolicyConfiguration: {
        predefinedMetricSpecification: {
          predefinedMetricType: 'ECSServiceAverageMemoryUtilization',
        },
        targetValue: 50,
        scaleInCooldown: 60,
        scaleOutCooldown: 60,
      },
    }
  )
}

type CreateECSFargateParams = {
  image: awsx.ecr.Image
  subnetIds: pulumi.Input<pulumi.Input<string>[]>
  taskSecurityGroup: SecurityGroup
  defaultSecurityGroupId: Promise<string>
  targetGroup: TargetGroup
  port: number
  packageType: PackageType
}
