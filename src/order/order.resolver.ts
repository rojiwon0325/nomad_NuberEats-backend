import { AuthUser } from '@auth/auth.decorator';
import { Role } from '@auth/role.decorator';
import { CoreOutput } from '@global/dto/global.dto';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from '@user/entity/user.entity';
import { CreateOrderInput } from './order.dto';
import { OrderService } from './order.service';

@Resolver()
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Mutation(() => CoreOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args() createOrderInput: CreateOrderInput,
  ): Promise<CoreOutput> {
    return this.orderService.createOrder(customer, createOrderInput);
  }
}
