import express from "express"
import crypto from "crypto"
import Razorpay from "razorpay"

import supabase from "../config/supabase.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const FREE_SHIPPING_THRESHOLD = 999
const SHIPPING_FEE = 79
const TAX_RATE = 0

const calculateTotals = (cartItems) => {
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + Number(item.products.price) * item.quantity
  }, 0)

  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE

  const tax = subtotal * TAX_RATE

  const total = subtotal + shipping + tax

  return {
    subtotal,
    shipping,
    tax,
    total,
  }
}

/*
 * Create local pending order + Razorpay order
 */
router.post("/razorpay/create-order", authenticateToken, async (req, res) => {
  try {
    const { shippingAddress } = req.body
    const userId = req.user.id

    if (!shippingAddress) {
      return res.status(400).json({
        message: "Shipping address is required",
      })
    }

    const requiredFields = [
      "streetAddress",
      "city",
      "state",
      "postalCode",
      "country",
    ]

    for (const field of requiredFields) {
      if (!shippingAddress[field]?.trim()) {
        return res.status(400).json({
          message: `${field} is required`,
        })
      }
    }

    /*
     * IMPORTANT:
     * Get the cart from the database.
     * Never trust prices supplied by React.
     */
    const { data: cartItems, error: cartError } = await supabase
      .from("cart")
      .select(`
        *,
        products (
          id,
          name,
          description,
          price,
          stock_quantity,
          image_url,
          is_active
        )
      `)
      .eq("user_id", userId)

    if (cartError) {
      console.error("Cart fetch error:", cartError)

      return res.status(500).json({
        message: "Failed to fetch cart",
      })
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      })
    }

    /*
     * Validate products and stock
     */
    for (const item of cartItems) {
      if (!item.products) {
        return res.status(400).json({
          message: "A product in your cart is no longer available",
        })
      }

      if (!item.products.is_active) {
        return res.status(400).json({
          message: `${item.products.name} is no longer available`,
        })
      }

      if (item.products.stock_quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.products.name}`,
        })
      }

      if (item.quantity <= 0) {
        return res.status(400).json({
          message: `Invalid quantity for ${item.products.name}`,
        })
      }
    }

    const totals = calculateTotals(cartItems)

    /*
     * Create shipping address
     */
    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        street_address: shippingAddress.streetAddress,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postalCode,
        country: shippingAddress.country,
        is_default: false,
      })
      .select()
      .single()

    if (addressError) {
      console.error("Address creation error:", addressError)

      return res.status(500).json({
        message: "Failed to create shipping address",
      })
    }

    /*
     * Create our local pending order first.
     *
     * payment_intent_id will temporarily contain
     * the Razorpay order ID after it is created.
     */
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        total_amount: totals.total,
        shipping_address_id: address.id,
        status: "pending",
        payment_method: "razorpay",
      })
      .select()
      .single()

    if (orderError) {
      console.error("Local order creation error:", orderError)

      return res.status(500).json({
        message: "Failed to create order",
      })
    }

    /*
     * Create order items using prices from DB.
     */
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: Number(item.products.price),
    }))

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (orderItemsError) {
      console.error("Order items creation error:", orderItemsError)

      await supabase
        .from("orders")
        .delete()
        .eq("id", order.id)

      return res.status(500).json({
        message: "Failed to create order items",
      })
    }

    /*
     * Razorpay expects the amount in the smallest currency unit.
     *
     * ₹499 -> 49900 paise
     */
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totals.total * 100),
      currency: "INR",
      receipt: `bookstore_${order.id}`,
      notes: {
        local_order_id: order.id,
        user_id: userId,
      },
    })

    /*
     * Save Razorpay order ID against our local order.
     */
    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({
        payment_intent_id: razorpayOrder.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)

    if (updateOrderError) {
      console.error(
        "Failed to save Razorpay order ID:",
        updateOrderError,
      )

      return res.status(500).json({
        message: "Failed to initialize payment",
      })
    }

    res.status(201).json({
      message: "Razorpay order created",
      keyId: process.env.RAZORPAY_KEY_ID,

      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },

      localOrderId: order.id,

      totals,
    })
  } catch (error) {
    console.error("Razorpay create order error:", error)

    res.status(500).json({
      message: "Failed to create Razorpay order",
    })
  }
})

/*
 * Verify Razorpay payment
 */
router.post("/razorpay/verify", authenticateToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body

    const userId = req.user.id

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Missing payment verification details",
      })
    }

    /*
     * IMPORTANT:
     * Get our trusted Razorpay order ID from our database.
     *
     * Do not blindly trust the order ID returned by the browser
     * for signature generation.
     */
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("payment_intent_id", razorpay_order_id)
      .eq("user_id", userId)
      .single()

    if (orderError || !order) {
      return res.status(404).json({
        message: "Order not found",
      })
    }

    /*
     * Idempotency:
     * If this payment has already been processed, return the order.
     */
    if (
      order.status === "confirmed" &&
      order.payment_intent_id === razorpay_order_id
    ) {
      return res.json({
        message: "Payment already processed",
        orderId: order.id,
      })
    }

    /*
     * Verify Razorpay signature.
     */
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.payment_intent_id}|${razorpay_payment_id}`)
      .digest("hex")

    const generatedBuffer = Buffer.from(generatedSignature, "hex")
    const receivedBuffer = Buffer.from(razorpay_signature, "hex")

    const signaturesMatch =
      generatedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(generatedBuffer, receivedBuffer)

    if (!signaturesMatch) {
      return res.status(400).json({
        message: "Payment verification failed",
      })
    }

    /*
     * Fetch payment directly from Razorpay.
     *
     * This gives us an additional server-side check.
     */
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id,
    )

    if (!payment) {
      return res.status(400).json({
        message: "Payment could not be found",
      })
    }

    if (payment.order_id !== order.payment_intent_id) {
      return res.status(400).json({
        message: "Payment does not belong to this order",
      })
    }

    if (payment.currency !== "INR") {
      return res.status(400).json({
        message: "Invalid payment currency",
      })
    }

    if (payment.status !== "captured") {
      return res.status(400).json({
        message: `Payment is ${payment.status}`,
      })
    }

    /*
     * Verify the amount against our local order.
     */
    const expectedAmount = Math.round(
      Number(order.total_amount) * 100,
    )

    if (Number(payment.amount) !== expectedAmount) {
      return res.status(400).json({
        message: "Payment amount mismatch",
      })
    }

    /*
     * Fetch order items + products to validate stock again.
     */
    const { data: orderItems, error: orderItemsError } =
      await supabase
        .from("order_items")
        .select(`
          *,
          products (
            id,
            name,
            stock_quantity,
            is_active
          )
        `)
        .eq("order_id", order.id)

    if (orderItemsError || !orderItems) {
      return res.status(500).json({
        message: "Failed to verify order items",
      })
    }

    /*
     * Validate stock one final time before fulfillment.
     */
    for (const item of orderItems) {
      if (!item.products?.is_active) {
        return res.status(400).json({
          message: `${item.products?.name || "A product"} is no longer available`,
        })
      }

      if (item.products.stock_quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.products.name}`,
        })
      }
    }

    /*
     * Save payment ID and confirm order.
     */
    const { data: confirmedOrder, error: confirmError } =
      await supabase
        .from("orders")
        .update({
          status: "confirmed",
          payment_method: "razorpay",
          payment_intent_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("user_id", userId)
        .eq("status", "pending")
        .is("payment_id", null)
        .select()
        .maybeSingle()

    if (confirmError) {
      console.error("Order confirmation error:", confirmError)

      return res.status(500).json({
        message: "Failed to confirm order",
      })
    }

    if (!confirmedOrder) {
      const { data: currentOrder } = await supabase
        .from("orders")
        .select("id, status, payment_id")
        .eq("id", order.id)
        .eq("user_id", userId)
        .single()

      if (
        currentOrder?.status === "confirmed" &&
        currentOrder.payment_id === razorpay_payment_id
      ) {
        return res.json({
          message: "Payment already processed",
          orderId: order.id,
          paymentId: razorpay_payment_id,
        })
      }

      return res.status(409).json({
        message: "Order is already being processed",
      })
    }

    /*
     * Reduce stock.
     */
    for (const item of orderItems) {
      const newStock =
        item.products.stock_quantity - item.quantity

      const { error: stockError } = await supabase
        .from("products")
        .update({
          stock_quantity: Math.max(0, newStock),
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.product_id)

      if (stockError) {
        console.error("Stock update error:", stockError)
      }
    }

    /*
     * Clear cart.
     */
    const { error: clearCartError } = await supabase
      .from("cart")
      .delete()
      .eq("user_id", userId)

    if (clearCartError) {
      console.error("Cart clearing error:", clearCartError)
    }

    res.json({
      message: "Payment verified and order confirmed",
      orderId: order.id,
      paymentId: razorpay_payment_id,
    })
  } catch (error) {
    console.error("Razorpay verification error:", error)

    res.status(500).json({
      message: "Failed to verify payment",
    })
  }
})

export default router