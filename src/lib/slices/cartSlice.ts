// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// export interface CartItem {
//   id: number;
//   product_id: number;
//   product_name: string;
//   slug: string;
//   image: string;
//   product_price: number;
//   quantity: number;
//   stock: number;
//   product_weight: number;
// }

// interface CartState {
//   items: CartItem[];

//   totalQty: number;

//   subtotal: number;

//   shipping: number;

//   discount: number;

//   tax: number;

//   grandTotal: number;

//   coupon: string | null;
// }

// const initialState: CartState = {
//   items: [],

//   totalQty: 0,

//   subtotal: 0,

//   shipping: 0,

//   discount: 0,

//   tax: 0,

//   grandTotal: 0,

//   coupon: null,
// };

// const calculateTotals = (state: CartState) => {
//   state.totalQty = state.items.reduce((sum, item) => sum + item.quantity, 0);

//   state.subtotal = state.items.reduce(
//     (sum, item) => sum + item.product_price * item.quantity,
//     0
//   );

//   state.grandTotal =
//     state.subtotal +
//     state.shipping +
//     state.tax -
//     state.discount;
// };

// const cartSlice = createSlice({
//   name: "cart",

//   initialState,

//   reducers: {
//     addToCart: (state, action: PayloadAction<CartItem>) => {
//       const index = state.items.findIndex(
//         (item) => item.id === action.payload.id
//       );

//       if (index >= 0) {
//         state.items[index].quantity += action.payload.quantity;
//       } else {
//         state.items.push(action.payload);
//       }

//       calculateTotals(state);
//     },

//     removeFromCart: (state, action: PayloadAction<number>) => {
//       state.items = state.items.filter(
//         (item) => item.id !== action.payload
//       );

//       calculateTotals(state);
//     },

//     increaseQty: (state, action: PayloadAction<number>) => {
//       const item = state.items.find(
//         (item) => item.id === action.payload
//       );

//       if (item && item.quantity < item.stock) {
//         item.quantity++;
//       }

//       calculateTotals(state);
//     },

//     decreaseQty: (state, action: PayloadAction<number>) => {
//       const item = state.items.find(
//         (item) => item.id === action.payload
//       );

//       if (item && item.quantity > 1) {
//         item.quantity--;
//       }

//       calculateTotals(state);
//     },

//     clearCart: (state) => {
//       state.items = [];

//       state.totalQty = 0;

//       state.subtotal = 0;

//       state.shipping = 0;

//       state.tax = 0;

//       state.discount = 0;

//       state.grandTotal = 0;

//       state.coupon = null;
//     },

//     setShipping: (state, action: PayloadAction<number>) => {
//       state.shipping = action.payload;

//       calculateTotals(state);
//     },

//     setTax: (state, action: PayloadAction<number>) => {
//       state.tax = action.payload;

//       calculateTotals(state);
//     },

//     applyCoupon: (
//       state,
//       action: PayloadAction<{
//         code: string;
//         discount: number;
//       }>
//     ) => {
//       state.coupon = action.payload.code;

//       state.discount = action.payload.discount;

//       calculateTotals(state);
//     },
//     setCart: (
//   state,
//   action: PayloadAction<CartState>
// ) => {
//   state.items = action.payload.items;
//   state.totalQty = action.payload.totalQty;
//   state.subtotal = action.payload.subtotal;
//   state.shipping = action.payload.shipping;
//   state.discount = action.payload.discount;
//   state.tax = action.payload.tax;
//   state.grandTotal = action.payload.grandTotal;
//   state.coupon = action.payload.coupon;
// },
//   },
// });

// export const {
//   addToCart,
//   removeFromCart,
//   increaseQty,
//   decreaseQty,
//   clearCart,
//   setShipping,
//   setTax,
//   applyCoupon,
//   setCart,
// } = cartSlice.actions;

// export default cartSlice.reducer;