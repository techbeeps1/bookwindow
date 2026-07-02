import { Suspense } from "react";
import ShoppingCart from "./ShoppingCart";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading orders...</div>}>
      <ShoppingCart />
    </Suspense>
  );
}