export function priceInputToCents(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numeric)) {
    return Number.NaN;
  }

  const cents = Math.round(numeric * 100);
  return cents < 0 ? 0 : cents;
}

export function centsToPriceInput(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }
  return (value / 100).toString();
}
