export const CONVERSION_RATIOS = {
  g: { kg: 0.001 },
  kg: { g: 1000 },
  mL: { L: 0.001 },
  L: { mL: 1000 },
  item: { item: 1 }
};

export const UNIT_DIMENSIONS = {
  g: "WEIGHT",
  kg: "WEIGHT",
  mL: "VOLUME",
  L: "VOLUME",
  item: "COUNT"
};

export function convertQuantity(quantity, fromUnit, toUnit) {
  const amount = Number(quantity);

  if (!Number.isFinite(amount)) {
    throw new Error("Quantity must be a valid number");
  }

  if (!UNIT_DIMENSIONS[fromUnit] || !UNIT_DIMENSIONS[toUnit]) {
    throw new Error("Unsupported unit");
  }

  if (fromUnit === toUnit) {
    return amount;
  }
  
  if (UNIT_DIMENSIONS[fromUnit] !== UNIT_DIMENSIONS[toUnit]) {
    throw new Error("Dimension mismatch");
  }

  const ratio = CONVERSION_RATIOS[fromUnit]?.[toUnit];
  if (!ratio) {
    throw new Error("Conversion path not defined");
  }

  return Number((amount * ratio).toFixed(8));
}
