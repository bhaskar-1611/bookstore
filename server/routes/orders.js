import express from "express"
import { body, validationResult } from "express-validator"
import supabase from "../config/supabase.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Get user's orders
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            image_url
          )
        ),
        addresses (
          street_address,
          city,
          state,
          postal_code,
          country
        )
      `)
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return res.status(500).json({ message: "Failed to fetch orders" })
    }

    res.json({ orders })
  } catch (error) {
    console.error("Orders fetch error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single order
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    let query = supabase
      .from("orders")
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        order_items (
          *,
          products (
            id,
            name,
            image_url
          )
        ),
        addresses (
          street_address,
          city,
          state,
          postal_code,
          country
        )
      `)
      .eq("id", id)

    // If not admin, only show user's own orders
    if (req.user.role !== "admin") {
      query = query.eq("user_id", req.user.id)
    }

    const { data: order, error } = await query.single()

    if (error || !order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json({ order })
  } catch (error) {
    console.error("Order fetch error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Orders are created through the Razorpay payment flow in /api/payments.

// Update order status (Admin only)
router.put(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  [body("status").isIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"])],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const { status } = req.body

      const { data: order, error } = await supabase
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error || !order) {
        return res.status(404).json({ message: "Order not found or failed to update" })
      }

      res.json({ message: "Order status updated successfully", order })
    } catch (error) {
      console.error("Order status update error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

export default router
