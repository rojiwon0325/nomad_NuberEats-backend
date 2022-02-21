import { CoreOutput } from '@global/dto/global.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from '@restaurant/entity/dish.entity';
import { Restaurant } from '@restaurant/entity/restaurant.entity';
import { User } from '@user/entity/user.entity';
import { Repository } from 'typeorm';
import { Order } from './entity/order.entity';
import { OrderedDish } from './entity/orderedDish.entity';
import { CreateOrderInput } from './order.dto';

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
}
