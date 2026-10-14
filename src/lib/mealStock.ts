/**
 * Merchant form passes an absolute total quantity (not a +/- delta).
 * Remaining is derived as max(0, newTotal - alreadySold) so raising stock
 * adds unsold units and lowering stock never resurrects sold bags.
 */

export function nextQuantityRemaining(
  currentQuantity: number,
  currentRemaining: number,
  newQuantity: number
): number {
  const sold = Math.max(0, currentQuantity - currentRemaining);
  return Math.max(0, newQuantity - sold);
}

/** Thrown when a concurrent reserve/edit changed stock under an updateMeal write. */
export class MealStockConflictError extends Error {
  constructor(
    message = "Listing stock changed while you were editing. Please try again."
  ) {
    super(message);
    this.name = "MealStockConflictError";
  }
}
