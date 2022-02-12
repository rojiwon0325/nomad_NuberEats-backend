import { CoreOutput } from '@global/dto/global.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@user/entity/user.entity';
import { ILike, Repository } from 'typeorm';
import { Category } from './entity/category.entity';
import { Restaurant } from './entity/restaurant.entity';
import {
  ByNameInput,
  CreateRestaurantInput,
  EditRestaurantInput,
  NamePageInput,
  RestaurantOutput,
  RestaurantsOutput,
  SearchRestaurantInput,
} from './dto/restaurant.dto';
import {
  AllCategoryOutput,
  CategoryOutput,
  CreateCategoryInput,
} from './dto/category.dto';
import { PaginationInput } from '@global/dto/pagination.dto';
import {
  CreateDishInput,
  CreateDishOutput,
  DeleteDishInput,
  EditDishInput,
  EditDishOutput,
} from './dto/dish.dto';
import { Dish } from './entity/dish.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurant: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly category: Repository<Category>,
    @InjectRepository(Dish)
    private readonly dish: Repository<Dish>,
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

  async findAllCategory(): Promise<AllCategoryOutput> {
    try {
      const result = await this.category.find();
      return { ok: true, result };
    } catch {
      return { ok: false, error: '카테고리 리스트를 불러오지 못했습니다.' };
    }
  }

  countRestaurant(name: string): Promise<number> {
    return this.restaurant.count({ category: { name } });
  }

  async findCategoryByName({ name }: ByNameInput): Promise<CategoryOutput> {
    try {
      const category = await this.category.findOneOrFail({ name });
      return { ok: true, category };
    } catch {
      return { ok: false, error: '카테고리 정보를 불러오지 못했습니다.' };
    }
  }

  async findRestaurantByCategoryName({
    name,
    page,
  }: NamePageInput): Promise<RestaurantsOutput> {
    try {
      const [result, totalResults] = await this.restaurant.findAndCount({
        where: { category: { name } },
        take: 25,
        skip: (page - 1) * 25,
      });
      return {
        ok: true,
        result,
        totalResults,
        totalPage: Math.ceil(totalResults / 25),
      };
    } catch {
      return { ok: false, error: '가게 정보를 불러오지 못했습니다.' };
    }
  }

  async findAllRestaurant({
    page,
  }: PaginationInput): Promise<RestaurantsOutput> {
    try {
      const [result, totalResults] = await this.restaurant.findAndCount({
        take: 25,
        skip: (page - 1) * 25,
      });
      return {
        ok: true,
        result,
        totalResults,
        totalPage: Math.ceil(totalResults / 25),
      };
    } catch {
      return { ok: false, error: '가게 정보를 불러오지 못했습니다.' };
    }
  }

  async findRestaurantByName({ name }: ByNameInput): Promise<RestaurantOutput> {
    try {
      const result = await this.restaurant.findOneOrFail({ name });
      return { ok: true, result };
    } catch {
      return { ok: false, error: '가게 정보를 불러오지 못했습니다.' };
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

  async deleteRestaurant(
    owner: User,
    { name }: ByNameInput,
  ): Promise<CoreOutput> {
    try {
      const restaurant = await this.restaurant.findOneOrFail({ name });
      if (owner.id !== restaurant.ownerId) {
        return { ok: false, error: '가게 정보를 삭제할 권한이 없습니다.' };
      }
      await this.restaurant.delete({ name });
      return { ok: true };
    } catch {
      return { ok: false, error: '가게 정보를 삭제하지 못했습니다.' };
    }
  }

  async searchRestaurant({
    key,
    page,
  }: SearchRestaurantInput): Promise<RestaurantsOutput> {
    try {
      const [result, totalResults] = await this.restaurant.findAndCount({
        where: [
          {
            name: ILike(`%${key}%`),
          },
          {
            category: { name: ILike(`%${key}%`) },
          },
        ],
        take: 25,
        skip: (page - 1) * 25,
      });
      return {
        ok: true,
        result,
        totalResults,
        totalPage: Math.ceil(totalResults / 25),
      };
    } catch {
      return {
        ok: false,
        error: '검색 결과를 불러오지 못했습니다.',
      };
    }
  }

  async createDish(
    owner: User,
    { restaurantId, data }: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurant.findOneOrFail({
        id: restaurantId,
      });
      if (owner.id !== restaurant.id) {
        return { ok: false, error: '메뉴를 생성할 권한이 없습니다.' };
      }
      const dish = await this.dish.save(
        this.dish.create({ ...data, restaurant }),
      );
      return { ok: true, result: dish };
    } catch {
      return { ok: false, error: '메뉴를 생성하지 못했습니다.' };
    }
  }

  async checkDishPermision(
    ownerId: number,
    dishId: number,
  ): Promise<CoreOutput> {
    const dish = await this.dish.findOne(
      { id: dishId },
      { relations: ['restaurant'] },
    );
    if (!dish) {
      return { ok: false, error: '해당 메뉴를 찾지 못했습니다.' };
    }
    if (ownerId !== dish.restaurant.ownerId) {
      return { ok: false, error: '메뉴에 대한 권한이 없습니다.' };
    }
    return { ok: true };
  }

  async editDish(
    owner: User,
    { dishId, data }: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const permission = await this.checkDishPermision(owner.id, dishId);
      if (permission.ok) {
        await this.dish.save([{ id: dishId, data }]);
        return { ok: true };
      } else {
        return permission;
      }
    } catch {
      return { ok: false, error: '메뉴를 변경하지 못했습니다.' };
    }
  }
  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<CoreOutput> {
    try {
      const permission = await this.checkDishPermision(owner.id, dishId);
      if (permission.ok) {
        await this.dish.delete(dishId);
        return { ok: true };
      } else {
        return permission;
      }
    } catch {
      return { ok: false, error: '메뉴를 삭제하지 못했습니다.' };
    }
  }
}
