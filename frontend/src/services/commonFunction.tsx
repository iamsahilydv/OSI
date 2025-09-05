import api from "./api";

export const addToCart = async (
  productId: number,
  token: string,
  cartCount: number,
  setCartCount: React.Dispatch<React.SetStateAction<number>>,
  toast: any
) => {
  const body = {
    variation_id: productId,
  };
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const config = {
    headers: headers,
  };
  try {
    let res = await api.post("cart/items", body, config);
    // console.log(res);
    if (res.status === 201) {
      setCartCount(cartCount + 1);
      toast({
        title: "Added to Cart",
        description: ``,
        variant: "success",
      });
    } else {
      toast({
        title: "Something went wrong",
        description: `Item not added to your cart`,
        variant: "warning",
      });
    }
    return;
  } catch (error) {
    console.log(error);
    toast({
      title: "Internal Server Issue",
      description: `Item Already Present in Cart Or Server Issue`,
      variant: "warning",
    });
  }
};
