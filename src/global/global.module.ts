import { Global, Module } from '@nestjs/common';
import { PUBSUB } from './global.constant';
import { PubSub } from 'graphql-subscriptions';
@Global()
@Module({
  providers: [
    {
      provide: PUBSUB,
      useValue: new PubSub(),
    },
  ],
  exports: [PUBSUB],
})
export class GlobalModule {}
//서버가 여러개 일때 pubsub은 분리된 단일 서버에서 작동해야한다.
//그렇게 하지않으면 각 pubsub인스턴스간에는 통신하지 않아 정상적으로 알림이 가지 않는다.
