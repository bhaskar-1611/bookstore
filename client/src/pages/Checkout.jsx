"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CreditCard, Lock, MapPin } from "lucide-react"
import { paymentsAPI } from "../utils/api"
import { useCart } from "../contexts/CartContext"

const FREE_SHIPPING_THRESHOLD = 999
const SHIPPING_FEE = 79
const TAX_RATE = 0

const Checkout = () => {
  const { cartItems, total, loadCart } = useCart()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [shippingData, setShippingData] = useState({
    fullName: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  })

  const shipping =
    total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE

  const tax = total * TAX_RATE
  const finalTotal = total + shipping + tax

  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount)

  const handleShippingChange = (e) => {
    setShippingData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const validateShipping = () => {
    const fields = [
      ["fullName", "Full name"],
      ["streetAddress", "Street address"],
      ["city", "City"],
      ["state", "State"],
      ["postalCode", "Postal code"],
      ["country", "Country"],
    ]

    for (const [field, label] of fields) {
      if (!shippingData[field].trim()) {
        setError(`${label} is required`)
        return false
      }
    }

    return true
  }

  const handleRazorpayPayment = async () => {
    if (!validateShipping()) {
      return
    }

    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("accessToken")

      if (!token) {
        navigate("/login?redirect=/checkout")
        return
      }

      /*
      * Ask our backend to calculate the actual cart total
      * and create a Razorpay order.
      */
      const createResponse = await paymentsAPI.createRazorpayOrder(
        shippingData
      )

      const createData = createResponse.data

      if (!createData) {
        throw new Error("Failed to create payment")
      }

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout failed to load. Please refresh the page."
        )
      }

      const options = {
        key: createData.keyId,

        amount: createData.razorpayOrder.amount,

        currency: createData.razorpayOrder.currency,

        name: "BookStore",

        description: "BookStore Order",

        order_id: createData.razorpayOrder.id,

        prefill: {
          name: shippingData.fullName,
        },

        notes: {
          local_order_id: createData.localOrderId,
        },

        theme: {
          color: "#2563eb",
        },

        handler: async (response) => {
          try {
            setLoading(true)

            const verifyResponse =
              await paymentsAPI.verifyRazorpayPayment({
                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,
              })

            const verifyData = verifyResponse.data

            if (!verifyData) {
              throw new Error(
                "Payment verification failed"
              )
            }

            await loadCart()

            navigate(
              `/orders/${verifyData.orderId}?payment=success&method=razorpay&id=${verifyData.paymentId}`
            )
          } catch (verificationError) {
            console.error(
              "Payment verification error:",
              verificationError
            )

            setError(
              verificationError.response?.data?.message ||
                verificationError.message ||
                "Payment was successful, but order verification failed. Please contact support."
            )
          } finally {
            setLoading(false)
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)

      razorpay.on("payment.failed", (response) => {
        console.error(
          "Razorpay payment failed:",
          response.error
        )

        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        )

        setLoading(false)
      })

      razorpay.open()
    } catch (paymentError) {
      console.error(
        "Payment initialization error:",
        paymentError
      )

      setError(
        paymentError.response?.data?.message ||
          paymentError.message ||
          "Unable to initialize payment"
      )

      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>

          <p className="text-gray-600 mb-8">
            Add some books before checking out.
          </p>

          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Checkout
        </h1>

        <p className="text-gray-600 mt-2">
          Complete your order securely with Razorpay.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-3 space-y-6">
          {/* Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-5 h-5 text-blue-600" />

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Delivery Address
                </h2>

                <p className="text-sm text-gray-500">
                  Where should we deliver your books?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={shippingData.fullName}
                  onChange={handleShippingChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>

                <input
                  type="text"
                  name="streetAddress"
                  value={shippingData.streetAddress}
                  onChange={handleShippingChange}
                  placeholder="House number, street, area"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={shippingData.city}
                  onChange={handleShippingChange}
                  placeholder="Hyderabad"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={shippingData.state}
                  onChange={handleShippingChange}
                  placeholder="Telangana"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Code
                </label>

                <input
                  type="text"
                  name="postalCode"
                  value={shippingData.postalCode}
                  onChange={handleShippingChange}
                  placeholder="500001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>

                <select
                  name="country"
                  value={shippingData.country}
                  onChange={handleShippingChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="India">India</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <CreditCard className="w-5 h-5 text-blue-600" />

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Payment
                </h2>

                <p className="text-sm text-gray-500">
                  Secure payment powered by Razorpay
                </p>
              </div>

              <Lock className="w-4 h-4 text-green-600 ml-auto" />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-5">
              <p className="text-sm text-blue-800">
                Pay securely using <strong>UPI, cards,
                net banking or wallets</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRazorpayPayment}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3.5 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : `Pay ${formatINR(finalTotal)}`}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Your payment is securely processed by Razorpay.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6 max-h-72 overflow-y-auto">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3"
                >
                  <img
                    src={
                      item.products?.image_url ||
                      "/placeholder.svg"
                    }
                    alt={item.products?.name}
                    className="w-12 h-16 rounded object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.products?.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <span className="text-sm font-medium text-gray-900">
                    {formatINR(
                      Number(item.products?.price) *
                        item.quantity,
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-5 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Subtotal
                </span>

                <span className="font-medium">
                  {formatINR(total)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Shipping
                </span>

                <span className="font-medium">
                  {shipping === 0
                    ? "Free"
                    : formatINR(shipping)}
                </span>
              </div>

              {tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Tax
                  </span>

                  <span className="font-medium">
                    {formatINR(tax)}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="text-lg font-bold">
                  Total
                </span>

                <span className="text-xl font-bold text-blue-600">
                  {formatINR(finalTotal)}
                </span>
              </div>
            </div>

            {shipping === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-5">
                <p className="text-green-800 text-sm font-medium">
                  🎉 You qualify for free shipping!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout