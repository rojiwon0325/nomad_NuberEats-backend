import { AuthUser } from '@auth/auth.decorator';
import { Role } from '@auth/role.decorator';
import { CoreOutput } from '@global/dto/global.dto';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { User } from '@user/entity/user.entity';
import { Category } from './entity/category.entity';
import { Restaurant } from './entity/restaurant.entity';
import {
  ByIdInput,
  ByNameInput,
  CreateRestaurantInput,
  CreateRestaurantOutput,
  EditRestaurantInput,
  NamePageInput,
  RestaurantOutput,
  RestaurantsOutput,
  SearchRestaurantInput,
} from './dto/restaurant.dto';
import { RestaurantService } from './restaurant.service';
import {
  AllCategoryOutput,
  CategoryOutput,
  CreateCategoryInput,
  UpdateCategoryImageInput,
} from './dto/category.dto';
import { PaginationInput } from '@global/dto/pagination.dto';
import { Dish } from './entity/dish.entity';
import {
  CreateDishInput,
  CreateDishOutput,
  DeleteDishInput,
  EditDishInput,
  EditDishOutput,
} from './dto/dish.dto';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateRestaurantOutput)
  @Role(['Owner'])
  createRestaurant(
    @AuthUser() authUser: User,
    @Args('restaurant') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }

  @Mutation(() => CoreOutput)
  @Role(['Owner'])
  editRestaurant(
    @AuthUser() authUser: User,
    @Args() editRestaurantInput: EditRestaurantInput,
  ): Promise<CoreOutput> {
    return this.restaurantService.editRestaurant(authUser, editRestaurantInput);
  }

  @Mutation(() => CoreOutput)
  @Role(['Owner'])
  deleteRestaurant(
    @AuthUser() authUser: User,
    @Args() input: ByNameInput,
  ): Promise<CoreOutput> {
    return this.restaurantService.deleteRestaurant(authUser, input);
  }

  @Query(() => RestaurantsOutput)
  @Role(['Owner'])
  findAllMyRestaurant(
    @AuthUser() authUser: User,
    @Args() { page }: PaginationInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.findAllMyRestaurant(authUser, page);
  }

  @Query(() => RestaurantsOutput)
  findRestaurantByCategoryName(
    @Args() namePageInput: NamePageInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.findRestaurantByCategoryName(namePageInput);
  }

  @Query(() => RestaurantsOutput)
  findAllRestaurant(
    @Args() paginationInput: PaginationInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.findAllRestaurant(paginationInput);
  }

  @Query(() => RestaurantOutput)
  findRestaurantById(@Args() { id }: ByIdInput): Promise<RestaurantOutput> {
    return this.restaurantService.findRestaurantById(id);
  }

  @Query(() => RestaurantsOutput)
  searchRestaurant(
    @Args() searchRestaurantInput: SearchRestaurantInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.searchRestaurant(searchRestaurantInput);
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(() => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurant(category);
  }

  @Mutation(() => CoreOutput)
  @Role(['Admin'])
  createCategory(
    @Args('category') createCategoryInput: CreateCategoryInput,
  ): Promise<CoreOutput> {
    return this.restaurantService.createCategory(createCategoryInput);
  }

  @Mutation(() => CoreOutput)
  @Role(['Admin'])
  updateCategoryImage(@Args() update: UpdateCategoryImageInput) {
    return this.restaurantService.updateCategoryImage(update);
  }

  @Query(() => AllCategoryOutput)
  findAllCategory(): Promise<AllCategoryOutput> {
    return this.restaurantService.findAllCategory();
  }

  @Query(() => CategoryOutput)
  findCategoryByName(
    @Args() byNameInput: ByNameInput,
  ): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryByName(byNameInput);
  }
}

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateDishOutput)
  @Role(['Owner'])
  createDish(
    @AuthUser() owner: User,
    @Args() createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(owner, createDishInput);
  }

  @Mutation(() => CreateDishOutput)
  @Role(['Owner'])
  editDish(
    @AuthUser() owner: User,
    @Args() editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    return this.restaurantService.editDish(owner, editDishInput);
  }

  @Mutation(() => CreateDishOutput)
  @Role(['Owner'])
  deleteDish(
    @AuthUser() owner: User,
    @Args() deleteDishInput: DeleteDishInput,
  ): Promise<CoreOutput> {
    return this.restaurantService.deleteDish(owner, deleteDishInput);
  }
}
