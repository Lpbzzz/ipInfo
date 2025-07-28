import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RemoteLoggerService } from './remote-logger.service'

@Module({
  imports: [ConfigModule],
  providers: [RemoteLoggerService],
  exports: [RemoteLoggerService],
})
export class LoggerModule {}