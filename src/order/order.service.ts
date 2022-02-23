import { CoreOutput } from '@global/dto/global.dto';
import { Injectable } from '@nestjs/common';
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
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, orderList }: CreateOrderInput,
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
      await this.orderRepository.save(
        this.orderRepository.create({
          customer,
          restaurant,
          totalPrice,
          orderedDish: orderedDishList,
        }),
      );
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
    // 배달기사 배정은 어떻게 해야할까?
    try {
      const order = await this.orderRepository.findOne(orderId, {
        relations: ['restaurant'],
      });
      if (!order) {
        return { ok: false, error: '주문 정보를 찾지 못했습니다.' };
      }
      if (!this.checkPermisson(user, order)) {
        return { ok: false, error: '권힌이 없습니다.' };
      }
      if (user.role === UserRole.Owner) {
        switch (status) {
          case OrderStatus.Cooking:
          case OrderStatus.Waiting:
          case OrderStatus.Canceled:
          case OrderStatus.PickedUp:
            break;
          default:
            return { ok: false, error: '권힌이 없습니다.' };
        }
      } else {
        switch (status) {
          case OrderStatus.Delivered:
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
}
