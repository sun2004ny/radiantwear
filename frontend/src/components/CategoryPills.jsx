import React from 'react';
import { CATEGORIES } from '../data/products';
import { useShop } from '../context/ShopContext';

export const CategoryPills = () => {
  const { selectedCategory, setSelectedCategory, products } = useShop();

  const categoriesWithCount = CATEGORIES.map(cat => ({
    ...cat,
    count: cat.id === 'all'
      ? (products || []).length
      : (products || []).filter(p => (p.category || '').toLowerCase() === cat.id.toLowerCase()).length
  }));

  return (
    <div className="category-pills-wrap">
      <div className="category-pills">
        {categoriesWithCount.map(cat => (
          <button
            key={cat.id}
            className={`category-pill ${selectedCategory === cat.id ? 'category-pill--active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span>{cat.label}</span>
            <span className="category-pill-count">{cat.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
