import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { IpInfoModule } from './ip-info/ip-info.module'
import { LoggerModule } from './logger/logger.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    IpInfoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
