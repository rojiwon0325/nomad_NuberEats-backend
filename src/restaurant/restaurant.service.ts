import { CoreOutput } from '@global/global.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@user/entity/user.entity';
import { Repository } from 'typeorm';
import { Category } from './entity/category.entity';
import { Restaurant } from './entity/restaurant.entity';
import {
  CreateCategoryInput,
  CreateRestaurantInput,
  EditRestaurantInput,
} from './restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurant: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly category: Repository<Category>,
  ) {}

  async createCategory(
    createCategoryInput: CreateCategoryInput,
  ): Promise<CoreOutput> {
    try {
      await this.category.save(this.category.create(createCategoryInput));
      return { ok: true };
    } catch {
      return { ok: false, error: '카테고리를 생성하지 못했습니다.' };
    }
  }

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CoreOutput> {
    try {
      const category = await this.category.findOne({
        name: createRestaurantInput.category,
      });
      const newRestaurant = this.restaurant.create({
        ...createRestaurantInput,
        category,
      });
      newRestaurant.owner = owner;
      await this.restaurant.save(newRestaurant);
      return { ok: true };
    } catch {
      return { ok: false, error: '가게를 생성하지 못했습니다.' };
    }
  }

  async editRestaurant(
    owner: User,
    { restaurantId, data }: EditRestaurantInput,
  ): Promise<CoreOutput> {
    try {
      const restaurant = await this.restaurant.findOneOrFail({
        id: restaurantId,
      });
      if (owner.id !== restaurant.ownerId) {
        return { ok: false, error: '가게 정보를 변경할 권한이 없습니다.' };
      }
      const category = await this.category.findOne({ name: data.category });
      const { name, address, coverImage } = data;
      await this.restaurant.save([
        {
          id: restaurantId,
          name,
          address,
          coverImage,
          category,
        },
      ]);
      return { ok: true };
    } catch {
      return { ok: false, error: '가게 정보를 변경하지 못했습니다.' };
    }
  }
}
