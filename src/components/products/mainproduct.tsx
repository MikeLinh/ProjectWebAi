import React, { useState } from "react";

import backgroundp from "../../assets/images/backgroundproduct.png";

import bike1 from "../../assets/images/bike1.png";
import bike2 from "../../assets/images/bike2.png";
import bike3 from "../../assets/images/bike3.png";

import ProductCard from "../../components/products/productcard.tsx";
import SidebarFilter from "../../components/products/SlidebarFilter.tsx";

export default function MainProduct() {
  const [, setFilters] = useState<unknown>({});

  const products = [
    {
      id: 1,
      name: "Mountain Bike X1",
      price: 1200,
      originalPrice: 1500,
      image: bike1,
      rating: 5,
      reviewCount: 120,
      discount: 20,
    },
    {
      id: 2,
      name: "Road Bike Pro",
      price: 950,
      originalPrice: 1100,
      image: bike2,
      rating: 4,
      reviewCount: 80,
      discount: 15,
    },
    {
      id: 3,
      name: "Electric Bike E7",
      price: 1800,
      originalPrice: 2200,
      image: bike3,
      rating: 5,
      reviewCount: 200,
      discount: 18,
    },
    {
      id: 3,
      name: "Electric Bike E7",
      price: 1800,
      originalPrice: 2200,
      image: bike3,
      rating: 5,
      reviewCount: 200,
      discount: 18,
    },
    {
      id: 3,
      name: "Electric Bike E7",
      price: 1800,
      originalPrice: 2200,
      image: bike3,
      rating: 5,
      reviewCount: 200,
      discount: 18,
    },
    {
      id: 3,
      name: "Electric Bike E7",
      price: 1800,
      originalPrice: 2200,
      image: bike3,
      rating: 5,
      reviewCount: 200,
      discount: 18,
    },
    {
      id: 3,
      name: "Electric Bike E7",
      price: 1800,
      originalPrice: 2200,
      image: bike3,
      rating: 5,
      reviewCount: 200,
      discount: 18,
    },
     {
      id: 3,
      name: "Electric Bike E7",
      price: 1800,
      originalPrice: 2200,
      image: bike3,
      rating: 5,
      reviewCount: 200,
      discount: 18,
    },

  ];

  return (
    <div className="w-full mx-auto">
      {/* Banner */}
      <div
        className="w-full h-[180px] md:h-[220px] bg-cover bg-center relative flex flex-col items-center justify-center text-white"
        style={{ backgroundImage: `url(${backgroundp})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

               <div className="relative z-10 text-center space-y-2">
          <p className="text-sm md:text-base tracking-[3px] uppercase">
            Home / Products
          </p>

          <h1 className="text-3xl md:text-5xl font-bold tracking-wide">
            PRODUCTS
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar */}
          <div className="lg:w-[280px]">
            <SidebarFilter onFilterChange={setFilters} />
          </div>

          {/* Product Section */}
          <div className="flex-1">
            
            {/* Top bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  All Products
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Showing {products.length} products
                </p>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  Sort by:
                </span>

                <select
                  className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-red-400"
                >
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Best Rating</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-10">
              
              <button className="w-10 h-10 rounded-lg border border-gray-200 hover:border-red-400 hover:text-red-500 transition-colors">
                1
              </button>

              <button className="w-10 h-10 rounded-lg bg-red-500 text-white">
                2
              </button>

              <button className="w-10 h-10 rounded-lg border border-gray-200 hover:border-red-400 hover:text-red-500 transition-colors">
                3
              </button>

              <button className="px-4 h-10 rounded-lg border border-gray-200 hover:border-red-400 hover:text-red-500 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}