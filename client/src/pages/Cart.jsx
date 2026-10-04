"use client"

import { Link } from "react-router-dom"
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Truck,
} from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { useAuth } from "../contexts/AuthContext"

// Easy to change later when you decide the actual bookstore policy.
const FREE_SHIPPING_THRESHOLD = 999
const SHIPPING_FEE = 79

const Cart = () => {
  const {
    cartItems,
    total,
    loading,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCart()

  const { isAuthenticated } = useAuth()

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    await updateCartItem(itemId, newQuantity)
  }

  const handleRemoveItem = async (itemId) => {
    if (window.confirm("Remove this book from your cart?")) {
      await removeFromCart(itemId)
    }
  }

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      await clearCart()
    }
  }

  const shipping =
    total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE

  const grandTotal = total + shipping

  const itemCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0,
  )

  /*
   * Not logged in
   */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
          <div className="
            w-16
            h-16
            mx-auto
            rounded-full
            bg-blue-50
            flex
            items-center
            justify-center
            mb-6
          ">
            <ShoppingBag className="h-7 w-7 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Your cart is waiting
          </h1>

          <p className="text-gray-500 leading-relaxed mb-8">
            Please sign in to view your cart and continue shopping.
          </p>

          <Link
            to="/login"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              px-7
              py-3
              rounded-full
              bg-blue-600
              text-white
              font-semibold
              hover:bg-blue-700
              hover:shadow-lg
              transition-all
            "
          >
            Sign In
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  /*
   * Loading
   */
  if (loading) {
    return <CartSkeleton />
  }

  /*
   * Empty cart
   */
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="
            w-20
            h-20
            mx-auto
            rounded-full
            bg-blue-50
            flex
            items-center
            justify-center
            mb-6
          ">
            <BookOpen className="h-9 w-9 text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Your cart is empty
          </h1>

          <p className="text-gray-500 leading-relaxed mb-8">
            Looks like you haven't found your next story yet.
          </p>

          <Link
            to="/products"
            className="
              inline-flex
              items-center
              gap-2
              px-7
              py-3
              rounded-full
              bg-blue-600
              text-white
              font-semibold
              hover:bg-blue-700
              hover:shadow-lg
              transition-all
            "
          >
            Explore Books
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  /*
   * Cart
   */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Page Header */}
      <section className="
        bg-gradient-to-br
        from-blue-700
        via-blue-600
        to-blue-800
        text-white
      ">
        <div className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-9
        ">
          <p className="
            text-blue-100
            text-sm
            font-semibold
            uppercase
            tracking-wider
            mb-2
          ">
            Your Selection
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold">
            Your Cart
          </h1>

          <p className="mt-2 text-blue-100">
            {itemCount} {itemCount === 1 ? "book" : "books"} ready for checkout
          </p>
        </div>
      </section>

      <main className="
        max-w-7xl
        mx-auto
        px-4
        sm:px-6
        lg:px-8
        py-8
      ">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

          {/* =========================================
              CART ITEMS
          ========================================== */}
          <section>

            <div className="
              flex
              items-center
              justify-between
              mb-5
            ">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Selected Books
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Review your books before checkout.
                </p>
              </div>

              <button
                onClick={handleClearCart}
                className="
                  text-sm
                  font-semibold
                  text-red-500
                  hover:text-red-700
                  transition-colors
                "
              >
                Clear Cart
              </button>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => {
                const product = item.products
                const itemSubtotal =
                  Number(product.price) * item.quantity

                const stock = Number(product.stock_quantity || 0)

                return (
                  <div
                    key={item.id}
                    className="
                      bg-white
                      rounded-2xl
                      border
                      border-gray-100
                      shadow-sm
                      p-4
                      sm:p-5
                    "
                  >
                    <div className="
                      flex
                      gap-4
                      sm:gap-5
                    ">

                      {/* Book cover */}
                      <Link
                        to={`/products/${product.id}`}
                        className="
                          flex-shrink-0
                          w-24
                          sm:w-28
                          h-32
                          sm:h-36
                          rounded-xl
                          overflow-hidden
                          bg-blue-50
                          border
                          border-blue-100
                        "
                      >
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="
                              w-full
                              h-full
                              object-cover
                              hover:scale-105
                              transition-transform
                              duration-300
                            "
                          />
                        ) : (
                          <CartCoverPlaceholder
                            title={product.name}
                          />
                        )}
                      </Link>

                      {/* Information */}
                      <div className="flex-1 min-w-0">

                        <Link
                          to={`/products/${product.id}`}
                          className="
                            block
                            text-lg
                            sm:text-xl
                            font-bold
                            text-gray-900
                            leading-snug
                            hover:text-blue-600
                            transition-colors
                          "
                        >
                          {product.name}
                        </Link>

                        {product.author && (
                          <p className="
                            text-sm
                            text-gray-500
                            mt-1
                          ">
                            by {product.author}
                          </p>
                        )}

                        {product.categories?.name && (
                          <span className="
                            inline-block
                            mt-2
                            px-2.5
                            py-1
                            rounded-full
                            bg-blue-50
                            text-blue-700
                            text-xs
                            font-semibold
                          ">
                            {product.categories.name}
                          </span>
                        )}

                        <p className="
                          text-lg
                          font-bold
                          text-gray-900
                          mt-3
                        ">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>

                        {stock < item.quantity && (
                          <p className="
                            text-red-600
                            text-xs
                            font-medium
                            mt-2
                          ">
                            Only {stock} left in stock
                          </p>
                        )}

                        {/* Mobile subtotal */}
                        <div className="
                          flex
                          sm:hidden
                          items-center
                          justify-between
                          mt-4
                        ">
                          <QuantityControl
                            quantity={item.quantity}
                            stock={stock}
                            onDecrease={() =>
                              handleQuantityChange(
                                item.id,
                                item.quantity - 1,
                              )
                            }
                            onIncrease={() =>
                              handleQuantityChange(
                                item.id,
                                item.quantity + 1,
                              )
                            }
                          />

                          <span className="
                            font-bold
                            text-gray-900
                          ">
                            ₹{itemSubtotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Desktop controls */}
                      <div className="
                        hidden
                        sm:flex
                        flex-col
                        items-end
                        justify-between
                        flex-shrink-0
                      ">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="
                            p-2
                            rounded-lg
                            text-gray-400
                            hover:bg-red-50
                            hover:text-red-600
                            transition-colors
                          "
                          title="Remove book"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>

                        <QuantityControl
                          quantity={item.quantity}
                          stock={stock}
                          onDecrease={() =>
                            handleQuantityChange(
                              item.id,
                              item.quantity - 1,
                            )
                          }
                          onIncrease={() =>
                            handleQuantityChange(
                              item.id,
                              item.quantity + 1,
                            )
                          }
                        />

                        <span className="
                          text-lg
                          font-bold
                          text-gray-900
                        ">
                          ₹{itemSubtotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Mobile remove */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="
                        sm:hidden
                        flex
                        items-center
                        gap-1.5
                        mt-4
                        text-xs
                        font-semibold
                        text-red-500
                        hover:text-red-700
                      "
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Continue shopping */}
            <Link
              to="/products"
              className="
                inline-flex
                items-center
                gap-2
                mt-6
                text-sm
                font-semibold
                text-blue-600
                hover:text-blue-800
              "
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Continue Shopping
            </Link>
          </section>

          {/* =========================================
              ORDER SUMMARY
          ========================================== */}
          <aside>
            <div className="
              bg-white
              rounded-2xl
              border
              border-gray-100
              shadow-sm
              p-6
              lg:sticky
              lg:top-24
            ">
              <h2 className="
                text-xl
                font-bold
                text-gray-900
                mb-6
              ">
                Order Summary
              </h2>

              <div className="space-y-4">

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-semibold text-gray-900">
                    ₹{total.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="font-semibold text-gray-900">
                    {shipping === 0
                      ? "FREE"
                      : `₹${shipping.toLocaleString("en-IN")}`}
                  </span>
                </div>

                <div className="
                  border-t
                  border-gray-100
                  pt-4
                  flex
                  justify-between
                  items-end
                ">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      Total
                    </p>

                  </div>

                  <p className="
                    text-2xl
                    font-bold
                    text-blue-600
                  ">
                    ₹{grandTotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {/* Free shipping message */}
              {shipping > 0 ? (
                <div className="
                  mt-6
                  p-4
                  rounded-xl
                  bg-blue-50
                  border
                  border-blue-100
                ">
                  <div className="flex gap-3">
                    <Truck className="
                      h-5
                      w-5
                      text-blue-600
                      flex-shrink-0
                    " />

                    <div>
                      <p className="
                        text-sm
                        font-semibold
                        text-blue-900
                      ">
                        Free shipping awaits
                      </p>

                      <p className="
                        text-xs
                        text-blue-700
                        mt-1
                      ">
                        Add ₹{(
                          FREE_SHIPPING_THRESHOLD - total
                        ).toLocaleString("en-IN")}{" "}
                        more to qualify.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="
                  mt-6
                  p-4
                  rounded-xl
                  bg-green-50
                  border
                  border-green-100
                ">
                  <div className="flex gap-3">
                    <Truck className="
                      h-5
                      w-5
                      text-green-600
                      flex-shrink-0
                    " />

                    <div>
                      <p className="
                        text-sm
                        font-semibold
                        text-green-900
                      ">
                        Free shipping applied
                      </p>

                      <p className="
                        text-xs
                        text-green-700
                        mt-1
                      ">
                        Your order qualifies for free delivery.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Checkout */}
              <Link
                to="/checkout"
                className="
                  mt-6
                  w-full
                  min-h-12
                  rounded-xl
                  bg-blue-600
                  text-white
                  font-bold
                  flex
                  items-center
                  justify-center
                  gap-2
                  hover:bg-blue-700
                  hover:shadow-lg
                  transition-all
                "
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5" />
              </Link>

              {/* Security */}
              <div className="
                flex
                items-center
                justify-center
                gap-2
                mt-5
                text-xs
                text-gray-400
              ">
                <ShieldCheck className="h-4 w-4" />
                Secure checkout
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

/* =========================================
   Quantity Control
========================================= */

const QuantityControl = ({
  quantity,
  stock,
  onDecrease,
  onIncrease,
}) => {
  return (
    <div className="
      inline-flex
      items-center
      rounded-xl
      border
      border-gray-200
      bg-gray-50
      overflow-hidden
    ">
      <button
        onClick={onDecrease}
        disabled={quantity <= 1}
        className="
          w-9
          h-9
          flex
          items-center
          justify-center
          text-gray-600
          hover:bg-gray-100
          disabled:opacity-30
          disabled:cursor-not-allowed
        "
      >
        <Minus className="h-4 w-4" />
      </button>

      <span className="
        w-9
        text-center
        text-sm
        font-bold
        text-gray-900
      ">
        {quantity}
      </span>

      <button
        onClick={onIncrease}
        disabled={quantity >= stock}
        className="
          w-9
          h-9
          flex
          items-center
          justify-center
          text-gray-600
          hover:bg-gray-100
          disabled:opacity-30
          disabled:cursor-not-allowed
        "
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

/* =========================================
   Cover fallback
========================================= */

const CartCoverPlaceholder = ({ title }) => {
  const words = title.split(" ")

  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`
      : title.slice(0, 2)

  return (
    <div className="
      relative
      w-full
      h-full
      bg-gradient-to-br
      from-blue-50
      via-white
      to-blue-100
      flex
      items-center
      justify-center
      p-3
    ">
      <div className="
        absolute
        inset-2
        border
        border-blue-200
      " />

      <div className="relative text-center">
        <div className="
          w-9
          h-9
          mx-auto
          rounded-full
          bg-blue-600
          text-white
          flex
          items-center
          justify-center
          text-xs
          font-bold
        ">
          {initials.toUpperCase()}
        </div>

        <p className="
          mt-2
          text-[9px]
          font-serif
          font-bold
          text-blue-950
          line-clamp-3
        ">
          {title}
        </p>
      </div>
    </div>
  )
}

/* =========================================
   Loading
========================================= */

const CartSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="
        max-w-7xl
        mx-auto
        px-4
        sm:px-6
        lg:px-8
        py-10
      ">
        <div className="
          h-10
          w-48
          bg-gray-200
          rounded
          animate-pulse
          mb-8"
        />

        <div className="
          grid
          grid-cols-1
          lg:grid-cols-[1fr_360px]
          gap-8
        ">
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  h-40
                  bg-white
                  rounded-2xl
                  border
                  border-gray-100
                  animate-pulse
                "
              />
            ))}
          </div>

          <div className="
            h-80
            bg-white
            rounded-2xl
            border
            border-gray-100
            animate-pulse
          " />
        </div>
      </div>
    </div>
  )
}

export default Cart