export type PaymentMethod = 'card' | 'cash';

export interface OwnerProfile {
  id: number;
  user_id: number;
  payment_method_prefer: PaymentMethod;
}