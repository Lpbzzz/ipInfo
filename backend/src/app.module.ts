import { Module } from '@nestjs/common';
import { IpInfoModule } from './ip-info/ip-info.module';

@Module({
  imports: [IpInfoModule],
  controllers: [],
  providers: [],
})
export class AppModule {}