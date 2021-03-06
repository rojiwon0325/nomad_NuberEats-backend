import { CoreEntity } from '@global/global.entity';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType('VerificationInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Field(() => String)
  @Column()
  code: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  @ValidateNested()
  @Type(() => User)
  user: User;

  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }
}
