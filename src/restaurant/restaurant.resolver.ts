import { Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entity/restaurant.entity';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  @Query(() => Restaurant)
  isPizzaGood(): Restaurant {
    return { name: null };
  }
}
