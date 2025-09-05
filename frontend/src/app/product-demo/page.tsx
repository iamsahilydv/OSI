"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/components/layout/PageWrapper";
import { mockProducts } from "@/data/mockProduct";
import { Smartphone, Laptop, Shirt } from "lucide-react";

export default function ProductDemoPage() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof mockProducts>("mobilePhone");

  const categories = [
    {
      key: "mobilePhone" as const,
      name: "Mobile Phone",
      icon: Smartphone,
      description: "iPhone 15 Pro Max with dynamic attributes",
      color: "bg-blue-500"
    },
    {
      key: "laptop" as const,
      name: "Laptop",
      icon: Laptop,
      description: "MacBook Pro with processor, RAM, storage options",
      color: "bg-purple-500"
    },
    {
      key: "clothing" as const,
      name: "Clothing",
      icon: Shirt,
      description: "Premium T-Shirt with size, color, material",
      color: "bg-green-500"
    }
  ];

  const currentProduct = mockProducts[selectedCategory];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PageWrapper className="py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Multi-Category Product System Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience our new professional product page design that dynamically adapts to different product categories and their unique attributes.
          </p>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.key;
            
            return (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg scale-105"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </button>
            );
          })}
        </div>

        {/* Selected Product Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                <img
                  src={currentProduct.variations[0].images[0]}
                  alt={currentProduct.name}
                  className="w-full h-full object-contain p-6"
                />
              </div>
              <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentProduct.category}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentProduct.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  {currentProduct.description}
                </p>
                <div className="text-2xl font-bold text-primary">
                  ₹{parseInt(currentProduct.variations[0].selling_price).toLocaleString()}
                </div>
              </div>

              {/* Dynamic Attributes Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dynamic Attributes</h3>
                <div className="grid grid-cols-2 gap-4">
                  {currentProduct.categoryAttributes.slice(0, 4).map((attr) => (
                    <div key={attr.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-700 capitalize mb-1">
                        {attr.attribute_name.replace(/_/g, ' ')}
                        {attr.is_required && <span className="text-red-500 ml-1">*</span>}
                      </div>
                      <div className="text-xs text-gray-500">
                        Type: {attr.attribute_type}
                        {attr.options && ` (${attr.options.length} options)`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Key Features</h3>
                <ul className="space-y-1">
                  {currentProduct.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Variations */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Available Variations</h3>
                <div className="text-sm text-gray-600">
                  {currentProduct.variations.length} variations available with different attribute combinations
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Links */}
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-semibold">Try the Live Product Pages</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link
                key={category.key}
                href={`/product-demo/${category.key}`}
                className="block"
              >
                <Button className="w-full h-12 text-lg">
                  View {category.name} Page
                </Button>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
            <h4 className="text-lg font-semibold mb-2">What's New in This Design?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-4 rounded-lg">
                <div className="font-medium text-blue-600 mb-1">Dynamic Attributes</div>
                <div className="text-gray-600">Automatically adapts to any product category</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="font-medium text-green-600 mb-1">Professional UI</div>
                <div className="text-gray-600">Modern, clean design with smooth animations</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="font-medium text-purple-600 mb-1">Smart Variations</div>
                <div className="text-gray-600">Intelligent variation selection and filtering</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="font-medium text-orange-600 mb-1">Mobile Optimized</div>
                <div className="text-gray-600">Responsive design for all devices</div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}