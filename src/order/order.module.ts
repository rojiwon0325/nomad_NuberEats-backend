import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { Restaurant } from '@restaurant/entity/restaurant.entity';
import { OrderedDish } from './entity/orderedDish.entity';
import { Dish } from '@restaurant/entity/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Restaurant, OrderedDish, Dish])],
  providers: [OrderService, OrderResolver],
})
export class OrderModule {}
