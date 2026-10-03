"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  BookOpen,
  Check,
  Heart,
} from "lucide-react"
import { productsAPI } from "../utils/api"
import { useCart } from "../contexts/CartContext"
import { useAuth } from "../contexts/AuthContext"

const ProductDetail = () => {
  const { id } = useParams()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)

      const response = await productsAPI.getProduct(id)

      setProduct(response.data.product)
    } catch (error) {
      console.error("Failed to load product:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Please login to add items to cart")
      return
    }

    const result = await addToCart(product.id, quantity)

    if (result.success) {
      alert("Book added to cart!")
    } else {
      alert(result.error)
    }
  }

  const incrementQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity((previous) => previous + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((previous) => previous - 1)
    }
  }

  if (loading) {
    return <ProductDetailSkeleton />
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="
            w-16
            h-16
            mx-auto
            rounded-full
            bg-blue-50
            flex
            items-center
            justify-center
            mb-5
          ">
            <BookOpen className="h-7 w-7 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Book Not Found
          </h1>

          <p className="text-gray-500 mb-6">
            We couldn't find the book you're looking for.
          </p>

          <Link
            to="/products"
            className="
              inline-flex
              items-center
              gap-2
              px-5
              py-2.5
              rounded-full
              bg-blue-600
              text-white
              font-semibold
              hover:bg-blue-700
              transition-colors
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Books
          </Link>
        </div>
      </div>
    )
  }

  const images =
    product.product_images?.length > 0
      ? product.product_images
      : [
          {
            image_url: product.image_url || null,
          },
        ]

  const price = Number(product.price || 0)
  const discountPrice = Number(product.discount_price || price)
  const hasDiscount = discountPrice < price
  const stock = Number(product.stock_quantity || 0)

  const categoryName = product.categories?.name || "Book"

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to="/products"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-gray-500
            hover:text-blue-600
            transition-colors
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Books
        </Link>
      </div>

      {/* Main product section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="
          bg-white
          rounded-3xl
          border
          border-gray-100
          shadow-sm
          overflow-hidden
        ">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* =========================================
                LEFT — BOOK COVER
            ========================================== */}
            <div className="
              bg-gradient-to-br
              from-blue-50
              via-white
              to-blue-100
              p-6
              sm:p-10
              lg:p-14
            ">
              <div className="max-w-md mx-auto">

                {/* Main image */}
                <div className="
                  relative
                  aspect-[3/4]
                  rounded-2xl
                  overflow-hidden
                  bg-white
                  shadow-xl
                  border
                  border-blue-100
                ">
                  {images[selectedImage]?.image_url ? (
                    <img
                      src={images[selectedImage].image_url}
                      alt={product.name}
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                    />
                  ) : (
                    <BookCoverPlaceholder
                      title={product.name}
                      author={product.author}
                    />
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3 mt-5">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`
                          w-16
                          h-20
                          rounded-lg
                          overflow-hidden
                          border-2
                          bg-white
                          transition-all
                          ${
                            selectedImage === index
                              ? "border-blue-600 shadow-md"
                              : "border-transparent hover:border-blue-200"
                          }
                        `}
                      >
                        {image.image_url ? (
                          <img
                            src={image.image_url}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookCoverPlaceholder
                            title={product.name}
                            author={product.author}
                            small
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* =========================================
                RIGHT — BOOK INFORMATION
            ========================================== */}
            <div className="p-6 sm:p-10 lg:p-14 flex flex-col">

              {/* Category */}
              <div className="mb-4">
                <span className="
                  inline-flex
                  items-center
                  px-3
                  py-1
                  rounded-full
                  bg-blue-50
                  text-blue-700
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                ">
                  {categoryName}
                </span>
              </div>

              {/* Title */}
              <h1 className="
                text-3xl
                sm:text-4xl
                font-bold
                text-gray-900
                leading-tight
              ">
                {product.name}
              </h1>

              {/* Author */}
              {product.author && (
                <p className="mt-3 text-lg text-gray-500">
                  by{" "}
                  <span className="font-semibold text-gray-700">
                    {product.author}
                  </span>
                </p>
              )}

              {/* Divider */}
              <div className="h-px bg-gray-100 my-6" />

              {/* Price */}
              <div className="mb-6">
                {hasDiscount && (
                  <p className="
                    text-base
                    text-gray-400
                    line-through
                    mb-1
                  ">
                    ₹{price.toLocaleString("en-IN")}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <span className="
                    text-3xl
                    sm:text-4xl
                    font-bold
                    text-gray-900
                  ">
                    ₹{discountPrice.toLocaleString("en-IN")}
                  </span>

                  {hasDiscount && (
                    <span className="
                      px-2.5
                      py-1
                      rounded-full
                      bg-green-50
                      text-green-700
                      text-xs
                      font-bold
                    ">
                      Save ₹{(price - discountPrice).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-7">
                <h2 className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-900
                  mb-3
                ">
                  About the Book
                </h2>

                <p className="
                  text-gray-600
                  leading-7
                  text-[15px]
                ">
                  {product.description}
                </p>
              </div>

              {/* Stock */}
              <div className="
                flex
                items-center
                gap-2
                mb-6
              ">
                {stock > 0 ? (
                  <>
                    <span className="
                      w-2.5
                      h-2.5
                      rounded-full
                      bg-green-500"
                    />

                    <span className="
                      text-sm
                      font-semibold
                      text-green-700
                    ">
                      In stock
                    </span>

                    <span className="text-sm text-gray-400">
                      • {stock} available
                    </span>
                  </>
                ) : (
                  <>
                    <span className="
                      w-2.5
                      h-2.5
                      rounded-full
                      bg-red-500"
                    />

                    <span className="
                      text-sm
                      font-semibold
                      text-red-600
                    ">
                      Currently out of stock
                    </span>
                  </>
                )}
              </div>

              {/* Quantity */}
              {stock > 0 && (
                <div className="mb-6">
                  <p className="
                    text-sm
                    font-semibold
                    text-gray-700
                    mb-2
                  ">
                    Quantity
                  </p>

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
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="
                        w-11
                        h-11
                        flex
                        items-center
                        justify-center
                        text-gray-600
                        hover:bg-gray-100
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                        transition-colors
                      "
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="
                      w-12
                      text-center
                      font-bold
                      text-gray-900
                    ">
                      {quantity}
                    </span>

                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= stock}
                      className="
                        w-11
                        h-11
                        flex
                        items-center
                        justify-center
                        text-gray-600
                        hover:bg-gray-100
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                        transition-colors
                      "
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {stock > 0 ? (
                  <button
                    onClick={handleAddToCart}
                    className="
                      flex-1
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
                      active:scale-[0.99]
                      transition-all
                    "
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </button>
                ) : (
                  <button
                    disabled
                    className="
                      flex-1
                      min-h-12
                      rounded-xl
                      bg-gray-200
                      text-gray-500
                      font-bold
                      cursor-not-allowed
                    "
                  >
                    Out of Stock
                  </button>
                )}

                <button
                  type="button"
                  className="
                    w-12
                    min-h-12
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    text-gray-500
                    flex
                    items-center
                    justify-center
                    hover:border-blue-200
                    hover:text-blue-600
                    hover:bg-blue-50
                    transition-colors
                  "
                  title="Add to wishlist"
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              {/* Book details */}
              <div className="
                mt-8
                pt-7
                border-t
                border-gray-100
              ">
                <h2 className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-900
                  mb-4
                ">
                  Book Details
                </h2>

                <dl className="space-y-3">
                  <DetailRow
                    label="Category"
                    value={categoryName}
                  />

                  {product.author && (
                    <DetailRow
                      label="Author"
                      value={product.author}
                    />
                  )}

                  {product.publisher && (
                    <DetailRow
                      label="Publisher"
                      value={product.publisher}
                    />
                  )}

                  {product.edition && (
                    <DetailRow
                      label="Edition"
                      value={product.edition}
                    />
                  )}

                  {product.language && (
                    <DetailRow
                      label="Language"
                      value={product.language}
                    />
                  )}

                  {product.pages && (
                    <DetailRow
                      label="Pages"
                      value={product.pages}
                    />
                  )}

                  {product.isbn && (
                    <DetailRow
                      label="ISBN"
                      value={product.isbn}
                    />
                  )}
                </dl>
              </div>

              {/* Delivery reassurance */}
              <div className="
                mt-7
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-3
              ">
                <div className="
                  flex
                  items-center
                  gap-3
                  p-3
                  rounded-xl
                  bg-blue-50
                ">
                  <div className="
                    w-8
                    h-8
                    rounded-full
                    bg-white
                    flex
                    items-center
                    justify-center
                  ">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      Authentic Books
                    </p>
                    <p className="text-xs text-gray-500">
                      Quality guaranteed
                    </p>
                  </div>
                </div>

                <div className="
                  flex
                  items-center
                  gap-3
                  p-3
                  rounded-xl
                  bg-blue-50
                ">
                  <div className="
                    w-8
                    h-8
                    rounded-full
                    bg-white
                    flex
                    items-center
                    justify-center
                  ">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      Carefully Packed
                    </p>
                    <p className="text-xs text-gray-500">
                      Ready for your shelf
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* -----------------------------------------
   Detail row
------------------------------------------ */

const DetailRow = ({ label, value }) => {
  return (
    <div className="flex justify-between gap-6 text-sm">
      <dt className="text-gray-500">
        {label}
      </dt>

      <dd className="font-medium text-gray-800 text-right">
        {value}
      </dd>
    </div>
  )
}

/* -----------------------------------------
   Placeholder cover
------------------------------------------ */

const BookCoverPlaceholder = ({
  title,
  author,
  small = false,
}) => {
  const words = title.split(" ")

  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`
      : title.slice(0, 2)

  return (
    <div
      className={`
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
        ${small ? "p-2" : "p-10"}
      `}
    >
      <div
        className="
          absolute
          inset-5
          border
          border-blue-200
        "
      />

      <div className="relative text-center">
        <div
          className={`
            mx-auto
            rounded-full
            bg-blue-600
            text-white
            flex
            items-center
            justify-center
            font-bold
            shadow-md
            ${small ? "w-7 h-7 text-[9px]" : "w-20 h-20 text-2xl"}
          `}
        >
          {initials.toUpperCase()}
        </div>

        {!small && (
          <>
            <p className="
              mt-6
              font-serif
              font-bold
              text-xl
              text-blue-950
              leading-snug
            ">
              {title}
            </p>

            {author && (
              <p className="
                mt-2
                text-sm
                text-blue-700
              ">
                {author}
              </p>
            )}

            <div className="
              w-12
              h-px
              bg-blue-300
              mx-auto
              mt-5
            " />

            <p className="
              text-[10px]
              uppercase
              tracking-[0.25em]
              text-blue-500
              mt-3
            ">
              Bookstore
            </p>
          </>
        )}
      </div>
    </div>
  )
}

/* -----------------------------------------
   Loading skeleton
------------------------------------------ */

const ProductDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="
          bg-white
          rounded-3xl
          overflow-hidden
          border
          border-gray-100
          shadow-sm
        ">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-10 bg-blue-50">
              <div className="
                aspect-[3/4]
                max-w-md
                mx-auto
                bg-gray-200
                rounded-2xl
                animate-pulse
              " />
            </div>

            <div className="p-10 lg:p-14">
              <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse mb-5" />
              <div className="h-10 w-4/5 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse mb-8" />

              <div className="h-px bg-gray-100 mb-8" />

              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse mb-8" />

              <div className="space-y-3 mb-8">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
              </div>

              <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail