import { AuthUser } from '@auth/auth.decorator';
import { PubSub } from 'graphql-subscriptions';
import { Role } from '@auth/role.decorator';
import { CoreOutput } from '@global/dto/global.dto';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { User } from '@user/entity/user.entity';
import {
  CreateOrderInput,
  EditOrderInput,
  FindManyOrderInput,
  FindManyOrderOutput,
  FindOrderByIdInput,
  FindOrderByIdOutput,
} from './order.dto';
import { OrderService } from './order.service';

const pubsub = new PubSub();
@Resolver()
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Query(() => FindManyOrderOutput)
  @Role(['Any'])
  findManyOrder(
    @AuthUser() user: User,
    @Args() findManyOrderInput: FindManyOrderInput,
  ): Promise<FindManyOrderOutput> {
    return this.orderService.findMany(user, findManyOrderInput);
  }

  @Query(() => FindOrderByIdOutput)
  @Role(['Any'])
  findOrderById(
    @AuthUser() user: User,
    @Args() findOrderByIdInput: FindOrderByIdInput,
  ): Promise<FindOrderByIdOutput> {
    return this.orderService.findOne(user, findOrderByIdInput);
  }

  @Mutation(() => CoreOutput)
  @Role(['Client'])
  createOrder(
    @AuthUser() customer: User,
    @Args() createOrderInput: CreateOrderInput,
  ): Promise<CoreOutput> {
    return this.orderService.createOrder(customer, createOrderInput);
  }

  @Mutation(() => CoreOutput)
  @Role(['Owner', 'Rider'])
  editOrder(@AuthUser() user: User, @Args() editOrderInput: EditOrderInput) {
    return this.orderService.editOrder(user, editOrderInput);
  }

  @Query(() => Boolean)
  potato() {
    pubsub.publish('photo', {
      readyPhoto: 'hi nest',
    });
    return true;
  }

  @Subscription(() => String)
  readyPhoto(@AuthUser() user: User) {
    console.log(user);
    return pubsub.asyncIterator('photo');
  }
}
