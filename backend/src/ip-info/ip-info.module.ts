import { Module } from '@nestjs/common';
import { IpInfoController } from './ip-info.controller';
import { IpInfoService } from './ip-info.service';
import { IpLocationService } from './ip-location.service';

@Module({
  controllers: [IpInfoController],
  providers: [IpInfoService, IpLocationService],
})
export class IpInfoModule {}