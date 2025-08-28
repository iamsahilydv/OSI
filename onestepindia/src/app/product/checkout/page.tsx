"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, ChevronRight, Check } from "lucide-react";
import api from "@/services/api";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";

type Address = {
  id: string;
  AddressLine1: string;
  AddressLine2: string;
  City: string;
  State: string;
  PostalCode: string;
  Country: string;
  IsDefault: number;
};

type CartItem = {
  productId: number;
  variationId: number;
  quantity: number;
  name?: string;
  price?: number;
  image?: string;
  color?: string; // Add this
  size?: string; // Add this
  sku?: string; // Add this if needed
};

const CheckoutClientPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userAddress, setUserAddress] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>({});
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setCartCount } = useAuth();
  const token = Cookies.get("usrTkn");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Payment methods - mark all except COD as coming soon
  const paymentMethods = [
    { id: "credit", name: "Credit/Debit Card", comingSoon: true },
    { id: "upi", name: "UPI", comingSoon: true },
    { id: "netbanking", name: "Net Banking", comingSoon: true },
    { id: "cod", name: "Cash on Delivery", comingSoon: false },
  ];

  // Extract product or cart data from URL
  useEffect(() => {
    const productParam = searchParams.get("product");
    const cartParam = searchParams.get("cart");

    if (productParam) {
      try {
        const parsedItems: CartItem[] = JSON.parse(
          decodeURIComponent(productParam)
        );
        fetchProductDetails(parsedItems, true);
      } catch (error) {
        console.error("Error parsing product param:", error);
        toast({
          title: "Error",
          description: "Failed to load product data",
          variant: "destructive",
        });
        setIsLoadingItems(false);
      }
    } else if (cartParam) {
      try {
        const parsedItems: CartItem[] = JSON.parse(
          decodeURIComponent(cartParam)
        );
        fetchProductDetails(parsedItems, false);
      } catch (error) {
        console.error("Error parsing cart items:", error);
        toast({
          title: "Error",
          description: "Failed to load cart items",
          variant: "destructive",
        });
        setIsLoadingItems(false);
      }
    } else {
      setIsLoadingItems(false);
    }
  }, [searchParams]);

  // Fetch product details for items
  const fetchProductDetails = async (
    cartItems: CartItem[],
    isSingle: boolean
  ) => {
    try {
      if (isSingle) {
        const productId = cartItems[0].productId;
        const variationId = cartItems[0].variationId;
        const qty = cartItems[0].quantity;

        const res = await api.get(`/products/${productId}`, config);
        const product = res.data?.data;

        if (!product) throw new Error("Product not found");

        const variation = product.variations.find(
          (v: any) => v.id === variationId
        );
        if (!variation) throw new Error("Variation not found");

        const enrichedItem: CartItem = {
          productId,
          variationId,
          quantity: qty,
          name: product.name,
          price: parseFloat(variation.selling_price),
          image: variation.images?.[0] || product.images?.[0] || "",
          color: variation.color || product.color || "", // Add this
          size: variation.size || "", // Add this
        };

        setItems([enrichedItem]);
      } else {
        const res = await api.get("/cart/items", config);
        const enriched = res.data.result.map((item: any) => ({
          productId: item.product_id,
          variationId: item.variation_id,
          quantity: item.qty,
          name: item.product_name,
          price: item.latest_price,
          image: item.image_urls?.[0] || "",
          color: item.variation_color || item.color || "", // Add color from variation
          size: item.variation_size || item.size || "", // Add size from variation
          sku: item.sku || "", // Add SKU if available
          // Add any other variation-specific attributes you need
        }));
        setItems(enriched);
      }
    } catch (error) {
      console.error("Error in fetchProductDetails:", error);
      toast({
        title: "Error",
        description: "Failed to load item details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingItems(false);
    }
  };

  // Calculate order totals
  const itemTotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );
  const discount = items.length > 0 ? 0 : 0;
  const deliveryCharge = 0;
  const packagingFee: number = 0;
  const totalPayable = itemTotal - discount + deliveryCharge + packagingFee;

  // New address form state
  const [newAddress, setNewAddress] = useState<
    Omit<Address, "id" | "IsDefault"> & { IsDefault: boolean }
  >({
    AddressLine1: "",
    AddressLine2: "",
    City: "",
    State: "",
    PostalCode: "",
    Country: "India",
    IsDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/getAddress/${user?.id}`, config);
      setUserAddress(res.data?.message || []);

      const defaultAddress = res.data?.message?.find(
        (addr: Address) => addr.IsDefault === 1
      );
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAddresses();
    }
  }, [user?.id]);

  const handleAddNewAddress = async () => {
    try {
      setIsProcessing(true);
      const payload = {
        ...newAddress,
        IsDefault: newAddress.IsDefault ? 1 : 0,
      };

      const res = await api.post(`/addAddress/${user?.id}`, payload, config);

      if (res.status === 200) {
        toast({
          title: "Success",
          description: "Address added successfully",
        });
        fetchAddresses();
        setIsAddressModalOpen(false);
        setNewAddress({
          AddressLine1: "",
          AddressLine2: "",
          City: "",
          State: "",
          PostalCode: "",
          Country: "India",
          IsDefault: false,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      setIsUpdating((prev) => ({ ...prev, [addressId]: true }));
      await api.delete(`/deleteAddress/${user?.id}/${addressId}`, config);

      toast({
        title: "Success",
        description: "Address deleted successfully",
      });

      if (selectedAddress === addressId) {
        setSelectedAddress(null);
      }

      fetchAddresses();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    } finally {
      setIsUpdating((prev) => ({ ...prev, [addressId]: false }));
    }
  };

  const makeDefaultAddress = async (addressId: string) => {
    try {
      setIsUpdating((prev) => ({ ...prev, [addressId]: true }));
      await api.patch(
        `/updateAddress/${user?.id}/${addressId}`,
        { IsDefault: 1 },
        config
      );

      toast({
        title: "Success",
        description: "Default address updated",
      });

      fetchAddresses();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update address",
        variant: "destructive",
      });
    } finally {
      setIsUpdating((prev) => ({ ...prev, [addressId]: false }));
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast({
        title: "Address Required",
        description: "Please select a delivery address",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPayment) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const orderItems = items.map((item) => ({
        variation_id: item.variationId,
        qty: item.quantity,
      }));

      const res = await api.post(
        "/makeOrder",
        {
          items: orderItems,
          addressId: selectedAddress,
          paymentMode: selectedPayment,
        },
        {
          ...config,
          timeout: 60000,
        }
      );

      if (res.status === 201) {
        toast({
          title: "Order Placed",
          description: "Your order has been placed successfully",
          variant: "success",
        });

        setCartCount(0);
        // router.push("/orders");
      }
    } catch (error: any) {
      toast({
        title: "Checkout Failed",
        description:
          error.response?.data?.message ||
          "There was an error processing your order",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedAddressDetails = userAddress.find(
    (addr) => addr.id === selectedAddress
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress steps - reduced to 3 steps */}
        <div className="flex justify-between items-center mb-8 relative max-w-3xl mx-auto">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                } ${currentStep > step ? "bg-green-500" : ""}`}
              >
                {currentStep > step ? <Check className="h-6 w-6" /> : step}
              </div>
              <span className="text-xs mt-1 text-center">
                {step === 1 && "Address"}
                {step === 2 && "Payment"}
                {step === 3 && "Review"}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Checkout steps */}
          <div className="lg:w-2/3 bg-white rounded-lg shadow-sm p-6">
            {/* Step 1: Address Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Delivery Address</h2>

                <div className="flex justify-between items-center">
                  <p className="text-gray-600">
                    Select delivery address or add a new one
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="flex items-center gap-1"
                  >
                    Add New Address <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-32 bg-gray-100 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : userAddress.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-gray-500 mb-4">No addresses saved yet</p>
                    <Button onClick={() => setIsAddressModalOpen(true)}>
                      Add Your First Address
                    </Button>
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedAddress || ""}
                    onValueChange={(value) => {
                      setSelectedAddress(value);
                    }}
                    className="space-y-4"
                  >
                    {userAddress.map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-lg p-4 transition-colors ${
                          selectedAddress === address.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem
                            value={address.id}
                            id={address.id}
                            className="mt-0.5"
                          />
                          <label
                            htmlFor={address.id}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">
                              {address.AddressLine1}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {address.AddressLine2 && (
                                <div>{address.AddressLine2}</div>
                              )}
                              <div>
                                {address.City}, {address.State} -{" "}
                                {address.PostalCode}
                              </div>
                              <div>{address.Country}</div>
                            </div>

                            {address.IsDefault === 1 && (
                              <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                Default Address
                              </span>
                            )}
                          </label>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAddress(address.id);
                            }}
                            disabled={isUpdating[address.id]}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {address.IsDefault !== 1 && (
                          <div className="mt-3 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => makeDefaultAddress(address.id)}
                              disabled={isUpdating[address.id]}
                            >
                              {isUpdating[address.id]
                                ? "Processing..."
                                : "Make Default"}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                )}

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedAddress}
                    className="flex items-center gap-1"
                  >
                    Continue to Payment <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Payment Method</h2>
                <p className="text-gray-600">Choose your payment method</p>

                <RadioGroup
                  value={selectedPayment || ""}
                  onValueChange={setSelectedPayment}
                  className="space-y-3"
                >
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        selectedPayment === method.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      } ${
                        method.comingSoon
                          ? "opacity-70 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      onClick={() =>
                        !method.comingSoon && setSelectedPayment(method.id)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <RadioGroupItem
                            value={method.id}
                            id={method.id}
                            className="mr-3"
                            disabled={method.comingSoon}
                          />
                          <label
                            htmlFor={method.id}
                            className={`font-medium ${
                              method.comingSoon
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            {method.name}
                            {method.comingSoon && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                Coming Soon
                              </span>
                            )}
                          </label>
                        </div>
                        {method.id === "cod" && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={!selectedPayment}
                    className="flex items-center gap-1"
                  >
                    Review Order <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        All steps completed! Review your order before placing
                        it.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Delivery Address</h3>
                    {selectedAddressDetails ? (
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>{selectedAddressDetails.AddressLine1}</div>
                        {selectedAddressDetails.AddressLine2 && (
                          <div>{selectedAddressDetails.AddressLine2}</div>
                        )}
                        <div>
                          {selectedAddressDetails.City},{" "}
                          {selectedAddressDetails.State} -{" "}
                          {selectedAddressDetails.PostalCode}
                        </div>
                        <div>{selectedAddressDetails.Country}</div>
                        {selectedAddressDetails.IsDefault === 1 && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                            Default Address
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No address selected
                      </p>
                    )}
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Payment Method</h3>
                    <p className="text-sm text-gray-600">
                      {selectedPayment
                        ? paymentMethods.find((p) => p.id === selectedPayment)
                            ?.name
                        : "No payment method selected"}
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Order Items</h3>
                    {isLoadingItems ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex justify-between py-3">
                            <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="w-1/6 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    ) : items.length === 0 ? (
                      <p className="text-gray-500">No items in cart</p>
                    ) : (
                      <div className="divide-y">
                        {items.map((item, index) => (
                          <div key={index} className="py-3 flex gap-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">
                                      No Image
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Product Details */}
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  {/* Add color/size if available */}
                                  {item.color && (
                                    <p className="text-sm text-gray-500">
                                      Color: {item.color}
                                    </p>
                                  )}
                                  {item.size && (
                                    <p className="text-sm text-gray-500">
                                      Size: {item.size}
                                    </p>
                                  )}
                                </div>
                                <p className="font-medium">
                                  ₹{(item.price || 0).toLocaleString()}
                                </p>
                              </div>

                              <div className="flex justify-between items-end mt-2">
                                <p className="text-sm text-gray-500">
                                  Qty: {item.quantity}
                                </p>
                                {/* <p className="text-sm font-medium">
                                  Total: ₹
                                  {(
                                    (item.price || 0) * item.quantity
                                  ).toLocaleString()}
                                </p> */}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || items.length === 0}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                  >
                    {isProcessing ? "Placing Order..." : "Place Order"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              {isLoadingItems ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-1/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Price ({items.length} items)</span>
                    <span>₹{itemTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    {deliveryCharge == 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      <span>₹{deliveryCharge}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>Packaging Fee</span>
                    {packagingFee === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      <span>₹{packagingFee.toLocaleString()}</span>
                    )}
                  </div>

                  <div className="border-t pt-3 mt-2">
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total Payable</span>
                      <span>₹{totalPayable.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {items.length > 0 && (
                <div className="mt-6 text-green-600 text-sm font-medium">
                  Your Total Savings: ₹{discount.toLocaleString()}
                </div>
              )}

              {currentStep === 1 && selectedAddressDetails && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-medium mb-2">Delivering to:</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="font-medium">
                      {selectedAddressDetails.AddressLine1}
                    </div>
                    {selectedAddressDetails.AddressLine2 && (
                      <div>{selectedAddressDetails.AddressLine2}</div>
                    )}
                    <div>
                      {selectedAddressDetails.City},{" "}
                      {selectedAddressDetails.State} -{" "}
                      {selectedAddressDetails.PostalCode}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Address</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address1" className="text-right">
                Address Line 1*
              </Label>
              <Input
                id="address1"
                value={newAddress.AddressLine1}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, AddressLine1: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address2" className="text-right">
                Address Line 2
              </Label>
              <Input
                id="address2"
                value={newAddress.AddressLine2}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, AddressLine2: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                City*
              </Label>
              <Input
                id="city"
                value={newAddress.City}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, City: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="state" className="text-right">
                State*
              </Label>
              <Input
                id="state"
                value={newAddress.State}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, State: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="postalCode" className="text-right">
                Postal Code*
              </Label>
              <Input
                id="postalCode"
                value={newAddress.PostalCode}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, PostalCode: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">
                Country*
              </Label>
              <Input
                id="country"
                value={newAddress.Country}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, Country: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>

            <div className="flex items-center space-x-2 ml-[25%]">
              <Checkbox
                id="default"
                checked={newAddress.IsDefault}
                onCheckedChange={(checked: boolean) =>
                  setNewAddress({ ...newAddress, IsDefault: checked })
                }
              />
              <label
                htmlFor="default"
                className="text-sm font-medium leading-none"
              >
                Set as Default Address
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleAddNewAddress}
              disabled={
                !newAddress.AddressLine1 ||
                !newAddress.City ||
                !newAddress.State ||
                !newAddress.PostalCode ||
                isProcessing
              }
            >
              {isProcessing ? "Saving..." : "Save Address"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <CheckoutClientPage />
    </Suspense>
  );
}
