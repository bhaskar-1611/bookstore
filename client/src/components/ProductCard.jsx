"use client"

import { Link } from "react-router-dom"
import { ShoppingCart, ArrowRight } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { useAuth } from "../contexts/AuthContext"

const ProductCard = ({ product, viewMode = "grid" }) => {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  const price = Number(product.price || 0)
  const discountPrice = Number(product.discount_price || price)
  const hasDiscount = discountPrice < price
  const stock = Number(product.stock_quantity || 0)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      alert("Please login to add items to cart")
      return
    }

    const result = await addToCart(product.id, 1)

    if (result.success) {
      alert("Book added to cart!")
    } else {
      alert(result.error)
    }
  }

  const categoryName = product.categories?.name || "Book"

  /*
   * LIST VIEW
   */
  if (viewMode === "list") {
    return (
      <div
        className="
          group
          bg-white
          rounded-2xl
          border border-gray-100
          overflow-hidden
          shadow-sm
          hover:shadow-lg
          hover:border-blue-100
          transition-all
          duration-300
          flex
        "
      >
        {/* Cover */}
        <Link
          to={`/products/${product.id}`}
          className="
            w-36
            sm:w-44
            min-h-[220px]
            flex-shrink-0
            bg-blue-50
            overflow-hidden
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
                group-hover:scale-105
                transition-transform
                duration-500
              "
            />
          ) : (
            <BookCoverPlaceholder title={product.name} />
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
          <div className="flex-1">
            <Link to={`/products/${product.id}`}>
              <span className="
                inline-block
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-blue-600
                mb-2
              ">
                {categoryName}
              </span>

              <h3 className="
                text-xl
                font-bold
                text-gray-900
                leading-snug
                mb-1
                group-hover:text-blue-600
                transition-colors
              ">
                {product.name}
              </h3>

              {product.author && (
                <p className="text-sm text-gray-500 mb-4">
                  by <span className="font-medium">{product.author}</span>
                </p>
              )}

              <p className="
                text-sm
                text-gray-600
                leading-relaxed
                line-clamp-3
              ">
                {product.description}
              </p>
            </Link>

            <Link
              to={`/products/${product.id}`}
              className="
                inline-flex
                items-center
                gap-1
                mt-4
                text-sm
                font-semibold
                text-blue-600
                hover:text-blue-800
              "
            >
              View details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Price / Cart */}
          <div className="
            sm:w-40
            flex
            sm:flex-col
            items-center
            sm:items-end
            justify-between
            gap-4
          ">
            <div className="text-right">
              {hasDiscount && (
                <p className="text-sm text-gray-400 line-through">
                  ₹{price.toLocaleString("en-IN")}
                </p>
              )}

              <p className="text-2xl font-bold text-gray-900">
                ₹{discountPrice.toLocaleString("en-IN")}
              </p>

              {stock > 0 ? (
                <p className="text-xs text-emerald-600 mt-1 font-medium">
                  In stock
                </p>
              ) : (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  Out of stock
                </p>
              )}
            </div>

            {stock > 0 && (
              <button
                onClick={handleAddToCart}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-full
                  bg-blue-600
                  text-white
                  text-sm
                  font-semibold
                  hover:bg-blue-700
                  hover:shadow-md
                  active:scale-95
                  transition-all
                "
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  /*
   * GRID VIEW
   */
  return (
    <div
      className="
        group
        bg-white
        rounded-2xl
        border border-gray-100
        overflow-hidden
        shadow-sm
        hover:shadow-xl
        hover:-translate-y-1
        hover:border-blue-100
        transition-all
        duration-300
      "
    >
      {/* Book Cover */}
      <Link
        to={`/products/${product.id}`}
        className="
          relative
          block
          aspect-[3/4]
          bg-blue-50
          overflow-hidden
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
              group-hover:scale-105
              transition-transform
              duration-500
            "
          />
        ) : (
          <BookCoverPlaceholder title={product.name} />
        )}

        {/* Category */}
        <div className="
          absolute
          top-3
          left-3
          px-3
          py-1
          rounded-full
          bg-white/95
          backdrop-blur-sm
          text-xs
          font-semibold
          text-blue-700
          shadow-sm
        ">
          {categoryName}
        </div>
      </Link>

      {/* Details */}
      <div className="p-5">
        <Link to={`/products/${product.id}`}>
          <h3 className="
            text-lg
            font-bold
            text-gray-900
            leading-snug
            line-clamp-2
            min-h-[3.25rem]
            group-hover:text-blue-600
            transition-colors
          ">
            {product.name}
          </h3>

          {product.author && (
            <p className="
              text-sm
              text-gray-500
              mt-1
              truncate
            ">
              {product.author}
            </p>
          )}
        </Link>

        {/* Price + Cart */}
        <div className="
          flex
          items-end
          justify-between
          gap-3
          mt-5
        ">
          <div>
            {hasDiscount && (
              <span className="
                block
                text-xs
                text-gray-400
                line-through
              ">
                ₹{price.toLocaleString("en-IN")}
              </span>
            )}

            <span className="
              text-xl
              font-bold
              text-gray-900
            ">
              ₹{discountPrice.toLocaleString("en-IN")}
            </span>

            {stock > 0 ? (
              <span className="
                block
                text-xs
                text-emerald-600
                font-medium
                mt-1
              ">
                In stock
              </span>
            ) : (
              <span className="
                block
                text-xs
                text-red-500
                font-medium
                mt-1
              ">
                Out of stock
              </span>
            )}
          </div>

          {stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="
                flex
                items-center
                justify-center
                w-11
                h-11
                rounded-full
                bg-blue-600
                text-white
                hover:bg-blue-700
                hover:shadow-md
                active:scale-90
                transition-all
              "
              title="Add to cart"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/*
 * Temporary cover when image_url hasn't been populated yet.
 * This is much nicer than the generic gray broken-image block.
 */
const BookCoverPlaceholder = ({ title }) => {
  const words = title.split(" ")
  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`
      : title.slice(0, 2)

  return (
    <div
      className="
        relative
        w-full
        h-full
        overflow-hidden
        bg-gradient-to-br
        from-blue-50
        via-white
        to-blue-100
        flex
        items-center
        justify-center
        p-8
      "
    >
      <div
        className="
          absolute
          inset-5
          border
          border-blue-200
          rounded-sm
        "
      />

      <div className="relative text-center">
        <div className="
          mx-auto
          mb-4
          w-14
          h-14
          rounded-full
          bg-blue-600
          text-white
          flex
          items-center
          justify-center
          text-lg
          font-bold
          shadow-md
        ">
          {initials.toUpperCase()}
        </div>

        <p className="
          text-sm
          font-serif
          font-bold
          text-blue-900
          line-clamp-3
        ">
          {title}
        </p>

        <div className="
          w-10
          h-px
          bg-blue-300
          mx-auto
          mt-4
        " />

        <p className="
          text-[10px]
          uppercase
          tracking-[0.2em]
          text-blue-500
          mt-2
        ">
          Bookstore
        </p>
      </div>
    </div>
  )
}

export default ProductCard