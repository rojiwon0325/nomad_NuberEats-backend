import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entity/core.entity';
import { Column, Entity } from 'typeorm';
import { IsString } from 'class-validator';

enum UserRole {
  Client,
  Owner,
  Delivery,
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @IsString()
  @Field(() => String)
  email: string;

  @Column()
  @IsString()
  @Field(() => String)
  name: string;

  @Column({ type: 'enum', enum: UserRole })
  @IsString()
  @Field(() => UserRole)
  role: UserRole;
}
