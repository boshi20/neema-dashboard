import { describe, expect, it } from "vitest";
import { nextQuantityRemaining } from "@/lib/mealStock";

/**
 * In-memory stand-in for the optimistic updateMeal write + reserve_listing
 * decrement. Mirrors the client filter (quantity, quantity_remaining must
 * match) and the RPC's row-locked decrement.
 */
function applyMerchantAbsoluteQuantity(
  row: { quantity: number; quantity_remaining: number },
  newQuantity: number,
  expected: { quantity: number; quantity_remaining: number }
): boolean {
  if (
    row.quantity !== expected.quantity ||
    row.quantity_remaining !== expected.quantity_remaining
  ) {
    return false;
  }
  row.quantity = newQuantity;
  row.quantity_remaining = nextQuantityRemaining(
    expected.quantity,
    expected.quantity_remaining,
    newQuantity
  );
  return true;
}

function reserveOne(row: { quantity: number; quantity_remaining: number }): void {
  if (row.quantity_remaining <= 0) throw new Error("sold out");
  row.quantity_remaining -= 1;
}

function updateMealWithRetry(
  row: { quantity: number; quantity_remaining: number },
  newQuantity: number,
  maxAttempts = 3
): void {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const snapshot = {
      quantity: row.quantity,
      quantity_remaining: row.quantity_remaining,
    };
    // Simulate a concurrent reserve between read and write on the first try.
    if (attempt === 0) {
      reserveOne(row);
    }
    const ok = applyMerchantAbsoluteQuantity(row, newQuantity, snapshot);
    if (ok) return;
  }
  throw new Error("conflict");
}

describe("nextQuantityRemaining", () => {
  it("preserves sold count when raising total quantity", () => {
    // 10 total, 5 left → 5 sold; merchant sets total to 12 → 7 left
    expect(nextQuantityRemaining(10, 5, 12)).toBe(7);
  });

  it("never revives already-sold bags when lowering total", () => {
    // 10 total, 3 left → 7 sold; merchant sets total to 5 → 0 left
    expect(nextQuantityRemaining(10, 3, 5)).toBe(0);
  });
});

describe("updateMeal vs reserve_listing race", () => {
  it("without optimistic check, merchant write clobbers a concurrent reserve", () => {
    const row = { quantity: 10, quantity_remaining: 5 };
    const snapshot = { ...row };
    reserveOne(row); // rem → 4
    // Old buggy path: write remaining computed from stale snapshot
    row.quantity = 12;
    row.quantity_remaining = nextQuantityRemaining(
      snapshot.quantity,
      snapshot.quantity_remaining,
      12
    );
    // Oversells: shows 7 left but only 4 should remain after +2 stock and −1 reserve
    expect(row.quantity_remaining).toBe(7);
  });

  it("with optimistic retry, final remaining reflects both ops", () => {
    const row = { quantity: 10, quantity_remaining: 5 };
    updateMealWithRetry(row, 12);
    // +2 stock and −1 reserve from 5 left → 6 left
    expect(row).toEqual({ quantity: 12, quantity_remaining: 6 });
  });

  it("rejects the write when the snapshot no longer matches", () => {
    const row = { quantity: 10, quantity_remaining: 5 };
    const stale = { quantity: 10, quantity_remaining: 5 };
    reserveOne(row);
    expect(applyMerchantAbsoluteQuantity(row, 12, stale)).toBe(false);
    expect(row.quantity_remaining).toBe(4);
  });
});
