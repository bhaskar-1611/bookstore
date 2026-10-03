import express from "express"
import cors from "cors"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error("Origin not allowed by CORS"))
    },
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
import authRoutes from "./routes/auth.js"
import productRoutes from "./routes/products.js"
import categoryRoutes from "./routes/categories.js"
import orderRoutes from "./routes/orders.js"
import cartRoutes from "./routes/cart.js"
import adminRoutes from "./routes/admin.js"
import reviewRoutes from "./routes/reviews.js"
import wishlistRoutes from "./routes/wishlist.js"
import paymentRoutes from "./routes/payments.js"

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/wishlist", wishlistRoutes)
app.use("/api/payments", paymentRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running!", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`)
})
