import React from 'react';
import { Product, ProductVariant } from '../../types';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { Search, Tag, Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product, variantId?: number, variantName?: string) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const { theme, searchQuery } = useStore();
  
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredProducts.map((product) => (
        <div 
          key={product.id}
          className={cn(
            "group p-4 border rounded-2xl transition-all hover:shadow-lg cursor-pointer flex flex-col gap-3",
            theme === 'dark' ? "bg-slate-900 border-slate-800 hover:border-pink-500/50" : "bg-white border-slate-200 hover:border-emerald-500/50"
          )}
          onClick={() => !product.variants?.length && onAddToCart(product)}
        >
          <div className={cn(
            "aspect-square rounded-xl flex items-center justify-center mb-1",
            theme === 'dark' ? "bg-slate-800" : "bg-slate-50"
          )}>
            <Package size={32} className="text-slate-300" />
          </div>
          
          <div>
            <h4 className="font-bold text-sm truncate">{product.name}</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{product.category}</p>
          </div>
          
          <div className="mt-auto flex items-center justify-between">
            <span className={cn(
              "text-sm font-black",
              theme === 'clinic' ? "text-pink-600" : "text-emerald-600"
            )}>₱{product.price.toLocaleString()}</span>
            
            {product.variants && product.variants.length > 0 ? (
              <div className="flex gap-1">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product, v.id, v.name);
                    }}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold hover:bg-pink-100 dark:hover:bg-pink-900 transition-colors"
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            ) : (
              <span className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-lg",
                product.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {product.stock} in stock
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
