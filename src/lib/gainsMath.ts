// Ganancias: cuánto queda después de restar lo que te cuesta cada producto. Funciones puras (sin red ni pantalla).
// Solo cuentan las ventas pagadas. La ganancia se calcula únicamente con las ventas cuyo costo se conoce:
// las demás se avisan aparte, nunca se inventa un costo.
import { isRevenue, productKey, round2, type Sale } from './salesMath';

export interface CostRow {
  vendorId: string;
  productId: string;
  /** '' = vale para todos los planes del producto */
  plan: string;
  cost: number;
}
export type CostMap = Map<string, number>;

export const costKey = (vendorId: string, productId: string, plan: string) => `${vendorId}|${productId}|${plan}`;
export const buildCostMap = (rows: CostRow[]): CostMap => new Map(rows.map((r) => [costKey(r.vendorId, r.productId, r.plan), r.cost]));

/** Costo de una venta: el de su plan; si ese plan no tiene, el del producto en general; si tampoco, null. */
export function costOfSale(s: Pick<Sale, 'vendorId' | 'productId' | 'plan'>, costs: CostMap): number | null {
  if (!s.productId) return null;
  if (s.plan) {
    const exact = costs.get(costKey(s.vendorId, s.productId, s.plan));
    if (exact !== undefined) return exact;
  }
  return costs.get(costKey(s.vendorId, s.productId, '')) ?? null;
}

export interface GainTotals {
  /** Ingresos de todas las ventas pagadas */
  revenue: number;
  /** Ingresos de las ventas que tienen costo (con las que se calcula la ganancia) */
  revenueWithCost: number;
  cost: number;
  profit: number;
  /** Ganancia sobre lo vendido, en %, con un decimal. null si no hay ventas con costo */
  margin: number | null;
  paidSales: number;
  salesWithCost: number;
  salesMissingCost: number;
  /** Ingresos de las ventas pagadas que no tienen costo */
  revenueMissingCost: number;
}

export function gainTotals(sales: Sale[], costs: CostMap): GainTotals {
  const t: GainTotals = { revenue: 0, revenueWithCost: 0, cost: 0, profit: 0, margin: null, paidSales: 0, salesWithCost: 0, salesMissingCost: 0, revenueMissingCost: 0 };
  for (const s of sales) {
    if (!isRevenue(s)) continue;
    t.paidSales++;
    t.revenue += s.amount;
    const c = costOfSale(s, costs);
    if (c === null) {
      t.salesMissingCost++;
      t.revenueMissingCost += s.amount;
    } else {
      t.salesWithCost++;
      t.revenueWithCost += s.amount;
      t.cost += c;
    }
  }
  t.revenue = round2(t.revenue);
  t.revenueWithCost = round2(t.revenueWithCost);
  t.revenueMissingCost = round2(t.revenueMissingCost);
  t.cost = round2(t.cost);
  t.profit = round2(t.revenueWithCost - t.cost);
  t.margin = t.revenueWithCost > 0 ? Math.round((t.profit / t.revenueWithCost) * 1000) / 10 : null;
  return t;
}

export interface ProductGain {
  key: string;
  title: string;
  units: number;
  revenue: number;
  /** Ventas de este producto que sí tienen costo */
  withCost: number;
  missingCost: number;
  cost: number;
  profit: number;
  margin: number | null;
}

/** Ganancia por producto, de la que más deja a la que menos. Los que no tienen costo van al final. */
export function gainsByProduct(sales: Sale[], costs: CostMap): ProductGain[] {
  const map = new Map<string, ProductGain & { revWithCost: number }>();
  for (const s of sales) {
    if (!isRevenue(s)) continue;
    const key = productKey(s);
    const g = map.get(key) || { key, title: s.productTitle, units: 0, revenue: 0, withCost: 0, missingCost: 0, cost: 0, profit: 0, margin: null, revWithCost: 0 };
    g.units++;
    g.revenue += s.amount;
    const c = costOfSale(s, costs);
    if (c === null) g.missingCost++;
    else {
      g.withCost++;
      g.cost += c;
      g.revWithCost += s.amount;
    }
    map.set(key, g);
  }
  return [...map.values()]
    .map(({ revWithCost, ...g }) => {
      const profit = round2(revWithCost - g.cost);
      return { ...g, revenue: round2(g.revenue), cost: round2(g.cost), profit, margin: revWithCost > 0 ? Math.round((profit / revWithCost) * 1000) / 10 : null };
    })
    .sort((a, b) => (a.withCost === 0 ? 1 : 0) - (b.withCost === 0 ? 1 : 0) || b.profit - a.profit || b.revenue - a.revenue);
}

/** Lo que cada plan deja por venta si lo vendes a su precio: precio − costo. null si falta alguno de los dos. */
export function unitProfit(price: number | null, cost: number | null): { profit: number; margin: number } | null {
  if (price === null || cost === null || price <= 0) return null;
  const profit = round2(price - cost);
  return { profit, margin: Math.round((profit / price) * 1000) / 10 };
}

/**
 * Dónde se puede poner costo en un producto: con un solo plan, un costo general ('').
 * Con varios, un costo general (para los planes que no tengan el suyo y para ventas sin plan) y uno por plan.
 */
export function costPlanKeys(planNames: string[]): string[] {
  const names = planNames.map((n) => n.trim()).filter(Boolean);
  return names.length <= 1 ? [''] : ['', ...names];
}
