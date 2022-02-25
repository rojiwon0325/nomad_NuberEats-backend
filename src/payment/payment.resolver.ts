import { Query, Resolver } from '@nestjs/graphql';
import { Payment } from './entity/payment.entity';
import { PaymentService } from './payment.service';

@Resolver(() => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Query(() => Boolean)
  test(): boolean {
    return true;
  }
}
