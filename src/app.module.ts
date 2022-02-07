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
      entities: [User, Verification],
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      context: ({ req }) => ({ user: req['user'] }),
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
    GlobalModule,
    AuthModule,
    MailModule,
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
