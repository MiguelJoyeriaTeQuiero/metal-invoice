export interface InventoryItem {
  metal: 'GOLD' | 'SILVER';
  itemType: 'INGOT' | 'COIN';
  weightGrams: number;
  purity: number;
  purchased: number;
  sold: number;
  stock: number;
  avgCost: number;
  totalCostValue: number;
  totalSaleValue: number;
}
