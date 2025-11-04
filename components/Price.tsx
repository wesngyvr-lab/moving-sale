export type PriceProps = {
  priceCents: number | null;
  className?: string;
};

export function Price({ priceCents, className }: PriceProps) {
  if (priceCents === null) {
    return <span className={className}>FREE</span>;
  }

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(priceCents / 100);

  return <span className={className}>{formatted}</span>;
}

export default Price;
