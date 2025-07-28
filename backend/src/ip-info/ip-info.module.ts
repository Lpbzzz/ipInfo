import { Module } from '@nestjs/common'
import { IpInfoController } from './ip-info.controller'
import { IpInfoService } from './ip-info.service'
import { IpLocationService } from './ip-location.service'
import { LoggerModule } from '../logger/logger.module'

@Module({
  imports: [LoggerModule],
  controllers: [IpInfoController],
  providers: [IpInfoService, IpLocationService],
})
export class IpInfoModule {}
