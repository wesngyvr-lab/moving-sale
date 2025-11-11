import { centsToPriceInput, priceInputToCents } from "./price";

describe("priceInputToCents", () => {
  it("converts numeric strings into cents", () => {
    expect(priceInputToCents("12.34")).toEqual(1234);
  });

  it("returns null for empty values", () => {
    expect(priceInputToCents("")).toBeNull();
    expect(priceInputToCents(null)).toBeNull();
    expect(priceInputToCents(undefined)).toBeNull();
  });

  it("rounds to the nearest cent and never returns negatives", () => {
    expect(priceInputToCents("9.995")).toEqual(1000);
    expect(priceInputToCents(-3)).toEqual(0);
  });

  it("returns NaN for invalid input", () => {
    expect(Number.isNaN(priceInputToCents("abc"))).toBe(true);
  });
});

describe("centsToPriceInput", () => {
  it("converts cents to display string", () => {
    expect(centsToPriceInput(1234)).toEqual("12.34");
  });

  it("returns empty string for nullish values", () => {
    expect(centsToPriceInput(null)).toEqual("");
    expect(centsToPriceInput(undefined)).toEqual("");
  });
});
