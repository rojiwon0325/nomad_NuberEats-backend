import { InputType, PickType } from '@nestjs/graphql';
import { User } from './entity/user.entity';

@InputType()
export class CreateAccountInput extends PickType(User, ['email', 'role']) {}
