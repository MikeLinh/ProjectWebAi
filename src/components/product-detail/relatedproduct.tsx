import React from "react";
import Card from "../../components/products/productcard.tsx"

interface RelatedProductsItem{
    id: number;
    name:string;
    price: number;
    originalPrice?:number;
    discount?:number;
    rating: number;
    reviewCount:number;
    category:string;
    image:string;
}
interface RelatedProductProps{
    products: RelatedProductsItem[];
}

export default function RelatedProducts({products} : RelatedProductProps){
    return(
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase text-black">Sản phẩm liên quan</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((item)=>(
                    <Card key={item.id} product={item}/>
                )
                )}
            </div>
        </div>
    )
}