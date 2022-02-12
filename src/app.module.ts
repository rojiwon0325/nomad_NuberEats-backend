import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import * as Joi from 'joi';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './user/entity/user.entity';
import { UserModule } from './user/user.module';
import { GlobalModule } from './global/global.module';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from '@jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from '@user/entity/verification.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailModule } from './mail/mail.module';
import * as path from 'path';
import { Restaurant } from '@restaurant/entity/restaurant.entity';
import { Category } from '@restaurant/entity/category.entity';
import { RestaurantModule } from '@restaurant/restaurant.module';
import { Dish } from '@restaurant/entity/dish.entity';
import { OrderModule } from './order/order.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'test', 'prod').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        EMAIL_EMAIL: Joi.string().required(),
        EMAIL_PASS: Joi.string().required(),
        EMAIL_HOST: Joi.string().required(),
        EMAIL_USER: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: true,
      logging: false,
      entities: [User, Verification, Restaurant, Category, Dish],
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      context: ({ req }) => {
        const ip = req.ip || req.connection.remoteAddress;
        const isMe = req['userIp'] === ip;
        return {
          user: isMe && req['user'],
          ip,
          isMe,
        };
      },
    }),
    MailerModule.forRoot({
      transport: `smtps://${process.env.EMAIL_EMAIL}:${process.env.EMAIL_PASS}@${process.env.EMAIL_HOST}`,
      defaults: {
        from: `"${process.env.EMAIL_USER}" <${process.env.EMAIL_EMAIL}>`,
      },
      template: {
        dir: path.join(__dirname, '/templates/'),
        adapter: new EjsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    JwtModule.forRoot({ privateKey: process.env.PRIVATE_KEY }),
    UserModule,
    RestaurantModule,
    GlobalModule,
    AuthModule,
    MailModule,
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/graphql',
      method: RequestMethod.ALL,
    });
  }
}
