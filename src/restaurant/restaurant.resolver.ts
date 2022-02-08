import { AuthUser } from '@auth/auth.decorator';
import { Role } from '@auth/role.decorator';
import { CoreOutput } from '@global/global.dto';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from '@user/entity/user.entity';
import { Restaurant } from './entity/restaurant.entity';
import {
  CreateCategoryInput,
  CreateRestaurantInput,
  EditRestaurantInput,
} from './restaurant.dto';
import { RestaurantService } from './restaurant.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CoreOutput)
  @Role(['Admin'])
  async createCategory(
    @Args('category') createCategoryInput: CreateCategoryInput,
  ): Promise<CoreOutput> {
    return this.restaurantService.createCategory(createCategoryInput);
  }

  @Mutation(() => CoreOutput)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('restaurant') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CoreOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }

  @Mutation(() => CoreOutput)
  @Role(['Owner'])
  async editRestaurant(
    @AuthUser() authUser: User,
    @Args() editRestaurantInput: EditRestaurantInput,
  ): Promise<CoreOutput> {
    return this.restaurantService.editRestaurant(authUser, editRestaurantInput);
  }
}
