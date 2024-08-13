import { ENV } from '../../env'
import type { CreateInfraParameter } from '../../type'
import { createECSfargateService } from '../../common/ecs'
import { createLoadBalancer } from '../../common/loadBalancer'
import { createSecurityGroup } from '../../common/securityGroup'

export const createServerInfra = ({
  vpcId,
  subnetIds,
  certificateArn,
  defaultSecurityGroupId,
  imageUri,
  cluster,
}: CreateInfraParameter) => {
  const { elbSecurityGroup, taskSecurityGroup } = createSecurityGroup({
    vpcId,
    packageType: 'server',
  })

  const { targetGroup } = createLoadBalancer({
    subnetIds,
    elbSecurityGroup,
    defaultSecurityGroupId,
    vpcId,
    certificateArn,
    packageType: 'server',
  })

  createECSfargateService({
    packageType: 'server',
    imageUri,
    port: ENV.serverPort,
    subnetIds: subnetIds,
    targetGroup,
    defaultSecurityGroupId,
    taskSecurityGroup,
    cluster,
  })
}
