"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Package,
  Tag,
  Hash,
  DollarSign,
  Edit,
  Save,
  X,
  Image as ImageIcon,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import api from "@/lib/api";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  brand: string;
  qty: number;
  is_pod: boolean;
  created_at: string;
  variations: any[];
  images: string[];
}

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onProductUpdate: () => void;
}

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  brand: z.string().min(1, "Brand is required"),
  qty: z.number().min(0, "Quantity must be 0 or greater"),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  onProductUpdate,
}: ProductDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      brand: product?.brand || "",
      qty: product?.qty || 0,
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      name: product?.name || "",
      description: product?.description || "",
      brand: product?.brand || "",
      qty: product?.qty || 0,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!product) return;

    setIsLoading(true);
    try {
      await api.patch("/update-product", {
        id: product.id,
        ...data,
      });
      onProductUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    if (!confirm("Are you sure you want to delete this product?")) return;

    setIsLoading(true);
    try {
      await api.delete("/delete-product", { data: { productId: product.id } });
      onProductUpdate();
      onClose();
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Details"
      size="xl"
    >
      <div className="space-y-6">
        {/* Product Images */}
        {product.images && product.images.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Product Images
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Product Information</h4>
          
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  {...register("name")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    {...register("brand")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  {errors.brand && (
                    <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    {...register("qty", { valueAsNumber: true })}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  {errors.qty && (
                    <p className="mt-1 text-sm text-red-600">{errors.qty.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Name:</span>
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Brand:</span>
                  <span className="font-medium">{product.brand}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Stock:</span>
                  <span className={`font-medium ${product.qty < 5 ? "text-red-600" : "text-green-600"}`}>
                    {product.qty}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500">Description:</span>
                <p className="mt-1 text-gray-900">{product.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Type:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.is_pod ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {product.is_pod ? "POD" : "Regular"}
                </span>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleEdit}
                  className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Product
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Delete Product
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Variations */}
        {product.variations && product.variations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Product Variations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.variations.map((variation, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">
                        Variation {index + 1}
                      </p>
                      {variation.color && (
                        <p className="text-xs text-gray-500">
                          Color: {variation.color}
                        </p>
                      )}
                      {variation.size && (
                        <p className="text-xs text-gray-500">
                          Size: {variation.size}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        ₹{variation.price || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Stock: {variation.stock || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
