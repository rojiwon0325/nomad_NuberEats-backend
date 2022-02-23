import { AuthUser } from '@auth/auth.decorator';
import { Role } from '@auth/role.decorator';
import { CoreOutput } from '@global/dto/global.dto';
import { PUBSUB } from '@global/global.constant';
import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { User } from '@user/entity/user.entity';
import { PubSub } from 'graphql-subscriptions';
import {
  CreateOrderInput,
  EditOrderInput,
  FindManyOrderInput,
  FindManyOrderOutput,
  FindOrderByIdInput,
  FindOrderByIdOutput,
} from './order.dto';
import { OrderService } from './order.service';

@Resolver()
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    @Inject(PUBSUB) private readonly pubsub: PubSub,
  ) {}

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
    this.pubsub.publish('photo', {
      readyPhoto: 'hi nest',
    });
    return true;
  }

  @Subscription(() => String)
  readyPhoto() {
    return this.pubsub.asyncIterator('photo');
  }
}
