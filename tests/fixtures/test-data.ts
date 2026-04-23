export interface CategoryData {
    name: string;
    productCount: number;
    url: string;
}

export interface ProductData {
    name: string;
    price: number;
    id: string;
}

// Export as object, not type
export const sharedData = {
    selectedCategory: null as CategoryData | null,
    filteredProducts: [] as ProductData[],
    addedProducts: [] as ProductData[],
    appliedFilter: null as string | null
};

// Alternative: Export as class if you prefer OOP approach
export class TestContext {
    selectedCategory: CategoryData | null = null;
    filteredProducts: ProductData[] = [];
    addedProducts: ProductData[] = [];
    appliedFilter: string | null = null;
}

// Export both for flexibility
export const testContext = new TestContext();