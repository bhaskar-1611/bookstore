"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  BookOpen,
  Sparkles,
  Heart,
  Drama,
  Headphones,
} from "lucide-react"

import { productsAPI, categoriesAPI } from "../utils/api"
import ProductCard from "../components/ProductCard"

const categoryIcons = {
  "Contemporary Fiction": BookOpen,
  Fantasy: Sparkles,
  Romance: Heart,
  Thriller: Drama,
  "Young Adult": BookOpen,
}

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        productsAPI.getProducts({
          limit: 8,
          sortBy: "created_at",
          sortOrder: "desc",
        }),
        categoriesAPI.getCategories(),
      ])

      setFeaturedProducts(productsResponse.data.products || [])
      setCategories(categoriesResponse.data.categories || [])
    } catch (error) {
      console.error("Failed to load home data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white">

      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">
                Your next great read is waiting
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Your Next
              <span className="block text-blue-100">
                Favorite Book
              </span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Explore stories that stay with you. From unforgettable
              romances to magical worlds and gripping thrillers,
              find your next favorite read.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Browse Books
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              <a
                href="#categories"
                className="inline-flex items-center justify-center border border-white/40 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200"
              >
                Explore Categories
              </a>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          FEATURES
      ========================================================= */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Free Shipping
                </h3>
                <p className="text-sm text-gray-600">
                  On eligible orders
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Secure Checkout
                </h3>
                <p className="text-sm text-gray-600">
                  Safe and secure payments
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <Headphones className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Customer Support
                </h3>
                <p className="text-sm text-gray-600">
                  We're here to help
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          CATEGORIES
      ========================================================= */}
      <section
        id="categories"
        className="py-16 md:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>

            <p className="text-lg text-gray-600">
              Find a story that matches your mood
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">

            {categories.map((category) => {
              const Icon =
                categoryIcons[category.name] || BookOpen

              return (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group"
                >
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300">

                    <div className="h-36 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">

                      <Icon
                        className="h-14 w-14 text-blue-600 group-hover:scale-110 transition-transform duration-300"
                        strokeWidth={1.5}
                      />

                    </div>

                    <div className="p-4 text-center">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                    </div>

                  </div>
                </Link>
              )
            })}

          </div>
        </div>
      </section>


      {/* =========================================================
          FEATURED BOOKS
      ========================================================= */}
      <section className="py-16 md:py-20 bg-gray-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">

            <div>
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">
                Handpicked for you
              </p>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Featured Books
              </h2>

              <p className="text-lg text-gray-600 mt-2">
                Discover some of our latest additions
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
            >
              View All Books
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        </div>
      </section>


      {/* =========================================================
          READING CTA
      ========================================================= */}
      <section className="py-16 md:py-20 bg-white">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl px-6 py-12 md:px-12 text-center text-white">

            <BookOpen className="h-10 w-10 mx-auto mb-5 text-blue-100" />

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              A good book is always a good idea.
            </h2>

            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
              Take a break, turn a page, and discover a story
              you'll want to remember.
            </p>

            <Link
              to="/products"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Exploring
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

          </div>

        </div>
      </section>

    </div>
  )
}

export default Home