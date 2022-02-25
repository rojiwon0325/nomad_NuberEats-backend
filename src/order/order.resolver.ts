import { AuthUser } from '@auth/auth.decorator';
import { Role } from '@auth/role.decorator';
import { CoreOutput } from '@global/dto/global.dto';
import {
  ASSIGN_RIDER,
  EDIT_ORDER_STATUS,
  NEW_ORDER,
  PUBSUB,
  WAITING_RIDER,
} from '@global/global.constant';
import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { User } from '@user/entity/user.entity';
import { PubSub } from 'graphql-subscriptions';
import { Order } from './entity/order.entity';
import {
  CreateOrderInput,
  EditOrderInput,
  FindManyOrderInput,
  FindManyOrderOutput,
  FindOrderByIdInput,
  FindOrderByIdOutput,
  TakeOrderInput,
  UpdateOrderInput,
} from './order.dto';
import { OrderService } from './order.service';

@Resolver(() => Order)
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

  @Mutation(() => CoreOutput)
  @Role(['Rider'])
  takeOrder(
    @AuthUser() rider: User,
    @Args() takeOrderInput: TakeOrderInput,
  ): Promise<CoreOutput> {
    return this.orderService.takeOrder(rider, takeOrderInput);
  }

  @Subscription(() => Order, {
    filter: ({ newOrder: { ownerId } }, _, { user }) =>
      typeof ownerId === 'number' && ownerId === user.id,
    resolve: ({ newOrder: { order } }) => order,
  })
  @Role(['Owner'])
  newOrder() {
    return this.pubsub.asyncIterator(NEW_ORDER);
  }

  @Subscription(() => Order, {
    filter: (
      { waitingRider: { delivery } }: { waitingRider: Order },
      {}, //지역 정보나 기타 필터링에 사용할 인자를 추가
    ) => delivery, //이미 필터링되어 publish했지만 휴먼 에러 방지 차원에서 필터링
  })
  @Role(['Rider'])
  waitingRider() {
    return this.pubsub.asyncIterator(WAITING_RIDER);
  }

  @Subscription(() => Order, {
    filter: (
      { updateOrder: { id, customerId } }: { updateOrder: Order },
      { id: orderId }: UpdateOrderInput,
      { user }: { user: User },
    ) => id === orderId && customerId === user.id,
  })
  @Role(['Client'])
  updateOrder(@Args() updateOrderInput: UpdateOrderInput) {
    return this.pubsub.asyncIterator(EDIT_ORDER_STATUS);
  }

  @Subscription(() => Order, {
    filter: (
      { assignRider: { restaurant } }: { assignRider: Order },
      _,
      { user }: { user: User },
    ) => restaurant.ownerId === user.id,
  })
  @Role(['Owner'])
  assignRider() {
    return this.pubsub.asyncIterator(ASSIGN_RIDER);
  }
}
