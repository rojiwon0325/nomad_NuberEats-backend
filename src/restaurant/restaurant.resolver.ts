import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
} from './dto/crudRestaurant.dto';
import { Restaurant } from './entity/restaurant.entity';
import { RestaurantService } from './restaurant.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Query(() => [Restaurant])
  findAllRestaurant(): Promise<Restaurant[]> {
    return this.restaurantService.findAll();
  }
  @Mutation(() => Boolean)
  async createRestaurant(
    @Args('data') createRestaurantDto: CreateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantDto);
      return true;
    } catch (e) {
      return false;
    }
  }
  @Mutation(() => Boolean)
  async updateRestaurant(@Args() data: UpdateRestaurantDto): Promise<boolean> {
    try {
      await this.restaurantService.updateRestaurant(data);
      return true;
    } catch (e) {
      return false;
    }
  }
}
