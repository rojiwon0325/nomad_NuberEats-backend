import { CoreOutput } from '@global/dto/global.dto';
import {
  ASSIGN_RIDER,
  EDIT_ORDER_STATUS,
  NEW_ORDER,
  PUBSUB,
  WAITING_RIDER,
} from '@global/global.constant';
import { PubSub } from 'graphql-subscriptions';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from '@restaurant/entity/dish.entity';
import { Restaurant } from '@restaurant/entity/restaurant.entity';
import { User, UserRole } from '@user/entity/user.entity';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entity/order.entity';
import { OrderedDish } from './entity/orderedDish.entity';
import {
  CreateOrderInput,
  EditOrderInput,
  FindManyOrderInput,
  FindManyOrderOutput,
  FindOrderByIdInput,
  FindOrderByIdOutput,
  TakeOrderInput,
} from './order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderedDish)
    private readonly orderedDishRepository: Repository<OrderedDish>,
    @InjectRepository(Restaurant)
    private readonly restaurantRespository: Repository<Restaurant>,
    @InjectRepository(Dish) private readonly dishRepository: Repository<Dish>,
    @Inject(PUBSUB) private readonly pubsub: PubSub,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, orderList, delivery, address }: CreateOrderInput,
  ): Promise<CoreOutput> {
    try {
      const restaurant = await this.restaurantRespository.findOne(restaurantId);
      if (!restaurant) {
        return { ok: false, error: '식당 정보를 찾지 못했습니다.' };
      }
      let totalPrice = 0;
      const orderedDishList: OrderedDish[] = [];
      for (const item of orderList) {
        const dish = await this.dishRepository.findOne(item.dishId);
        if (!dish) {
          return { ok: false, error: '음식 정보를 찾지 못했습니다.' };
        }
        let dishTotalPrice = dish.price;
        for (const itemOption of item.option) {
          const dishOption = dish.option.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            const extra = dishOption.choice.reduce((prev, cur) => {
              const check = itemOption.choice.find((name) => name === cur.name);
              return prev + (check ? cur.extraPrice : 0);
            }, 0);
            dishTotalPrice += extra;
          }
        }
        totalPrice += dishTotalPrice;
        const orderedDish = await this.orderedDishRepository.save(
          this.orderedDishRepository.create({
            name: dish.name,
            price: dish.price,
            option: item.option,
          }),
        );
        orderedDishList.push(orderedDish);
      }
      const order = await this.orderRepository.save(
        this.orderRepository.create({
          customer,
          restaurant,
          totalPrice,
          orderedDish: orderedDishList,
          delivery,
          address,
        }),
      );
      await this.pubsub.publish(NEW_ORDER, {
        newOrder: {
          order: {
            id: order.id,
            totalPrice,
            orderedDish: orderedDishList,
            delivery,
            address,
          },
          ownerId: restaurant.ownerId,
        },
      });
      return { ok: true };
    } catch {
      return { ok: false, error: '주문이 접수되지 않았습니다.' };
    }
  }

  async findMany(
    user: User,
    { status }: FindManyOrderInput,
  ): Promise<FindManyOrderOutput> {
    try {
      let order: Order[] = [];
      switch (user.role) {
        case UserRole.Client:
          order = await this.orderRepository.find({
            where: { customer: user },
            ...(status && { status }),
          });
          break;
        case UserRole.Rider:
          order = await this.orderRepository.find({
            where: { rider: user },
            ...(status && { status }),
          });
          break;
        case UserRole.Owner:
          const restaurant = await this.restaurantRespository.find({
            where: { owner: user },
            relations: ['order'],
          });
          order = restaurant.flatMap((restaurant) => restaurant.order);
          order = status
            ? order.filter((order) => order.status === status)
            : order;
          break;
        default:
          throw Error();
      }
      return { ok: true, order };
    } catch {
      return { ok: false, error: '주문 정보를 불러오지 못했습니다.' };
    }
  }

  checkPermisson(user: User, order: Order): boolean {
    switch (user.role) {
      case UserRole.Client:
        return order.customerId === user.id;
      case UserRole.Owner:
        return order.restaurant.ownerId === user.id;
      case UserRole.Rider:
        return order.riderId === user.id;
      default:
        return true;
    }
  }

  async findOne(
    user: User,
    { id: orderId }: FindOrderByIdInput,
  ): Promise<FindOrderByIdOutput> {
    try {
      const order = await this.orderRepository.findOne(orderId, {
        relations: ['restaurant'],
      });
      if (!order) {
        return { ok: false, error: '주문 정보를 찾지 못했습니다.' };
      }
      if (this.checkPermisson(user, order)) {
        return { ok: true, order };
      } else {
        return { ok: false, error: '권힌이 없습니다.' };
      }
    } catch {
      return { ok: false, error: '주문 정보를 불러오지 못했습니다.' };
    }
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<CoreOutput> {
    try {
      const order = await this.orderRepository.findOne(orderId);
      if (!order) {
        return { ok: false, error: '주문 정보를 찾지 못했습니다.' };
      }
      if (!this.checkPermisson(user, order)) {
        return { ok: false, error: '권힌이 없습니다.' };
      }

      const publish = (triggerName: string, keyName = 'updateOrder') =>
        this.pubsub.publish(triggerName, {
          [keyName]: {
            id: order.id,
            status,
            address: order.address,
            createdAt: order.createdAt,
            totalPrice: order.totalPrice,
            customerId: order.customerId,
            orderedDish: order.orderedDish,
            delievery: order.delivery,
            restaurant: {
              name: order.restaurant.name,
              address: order.restaurant.address,
            },
          },
        });

      if (user.role === UserRole.Owner) {
        switch (status) {
          case OrderStatus.Cooking:
            if (order.delivery) {
              await Promise.all([
                publish(WAITING_RIDER, 'waitingRider'),
                publish(EDIT_ORDER_STATUS),
              ]);
            } else {
              await publish(EDIT_ORDER_STATUS);
            }
            break;
          case OrderStatus.Canceled:
          case OrderStatus.PickedUp:
            await publish(EDIT_ORDER_STATUS);
          case OrderStatus.Waiting:
            break;
          default:
            return { ok: false, error: '권힌이 없습니다.' };
        }
      } else if (user.role === UserRole.Rider) {
        switch (status) {
          case OrderStatus.Delivered:
            await publish(EDIT_ORDER_STATUS);
          case OrderStatus.Delivering:
            break;
          default:
            return { ok: false, error: '권힌이 없습니다.' };
        }
      }
      await this.orderRepository.save([{ id: orderId, status }]);
      return { ok: true };
    } catch {
      return { ok: false, error: '주문 정보 변경에 실패하였습니다.' };
    }
  }

  async takeOrder(rider: User, { id }: TakeOrderInput): Promise<CoreOutput> {
    try {
      const order = await this.orderRepository.findOneOrFail({ id });
      if (order.rider) {
        return { ok: false, error: '이미 라이더가 배정되었습니다.' };
      }
      await this.orderRepository.save([{ id, rider }]);
      await this.pubsub.publish(ASSIGN_RIDER, { assignRider: order });
      return { ok: true };
    } catch {
      return { ok: false, error: '주문 정보를 찾지 못했습니다.' };
    }
  }
}
