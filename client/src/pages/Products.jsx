"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import {
  Filter,
  Grid,
  List,
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react"
import { productsAPI, categoriesAPI } from "../utils/api"
import ProductCard from "../components/ProductCard"

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState("grid")

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sortBy: searchParams.get("sortBy") || "created_at",
    sortOrder: searchParams.get("sortOrder") || "desc",
    page: Number.parseInt(searchParams.get("page")) || 1,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category") || ""

    setFilters((prev) => {
      if (prev.category === categoryFromUrl) {
        return prev
      }

      return {
        ...prev,
        category: categoryFromUrl,
        page: 1,
      }
    })
  }, [searchParams])

  useEffect(() => {
    loadProducts()
  }, [filters])

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories()
      setCategories(response.data.categories)
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)

      const params = { ...filters }

      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null) {
          delete params[key]
        }
      })

      const response = await productsAPI.getProducts(params)

      setProducts(response.data.products)
      setPagination(response.data.pagination)

      const newSearchParams = new URLSearchParams()

      Object.keys(params).forEach((key) => {
        if (params[key]) {
          newSearchParams.set(key, params[key])
        }
      })

      setSearchParams(newSearchParams)
    } catch (error) {
      console.error("Failed to load products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }))
  }

  const handlePageChange = (page) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }))

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "created_at",
      sortOrder: "desc",
      page: 1,
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.minPrice ||
    filters.maxPrice

  const selectedCategory = categories.find(
    (category) => category.id === filters.category,
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-blue-100 text-sm font-medium mb-3">
              <BookOpen className="h-4 w-4" />
              <span>Our Collection</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Discover your next favorite book.
            </h1>

            <p className="mt-4 text-blue-100 text-base sm:text-lg leading-relaxed">
              Explore romance, fantasy, contemporary fiction and more.
              Find a story that stays with you.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile filter button */}
        <div className="lg:hidden mb-5">
          <button
            onClick={() => setShowFilters(true)}
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              px-4
              py-3
              rounded-xl
              bg-white
              border
              border-gray-200
              shadow-sm
              text-gray-700
              font-semibold
              hover:border-blue-300
              hover:text-blue-600
              transition-colors
            "
          >
            <SlidersHorizontal className="h-5 w-5" />
            Filters & Sort
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile filter backdrop */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* Filters */}
          <aside
            className={`
              fixed
              lg:static
              inset-y-0
              left-0
              z-50
              lg:z-auto
              w-[310px]
              lg:w-64
              bg-white
              lg:bg-transparent
              shadow-2xl
              lg:shadow-none
              transform
              ${showFilters ? "translate-x-0" : "-translate-x-full"}
              lg:translate-x-0
              transition-transform
              duration-300
            `}
          >
            <div className="h-full lg:h-auto lg:sticky lg:top-24">
              <div className="bg-white rounded-none lg:rounded-2xl border border-gray-100 shadow-sm p-6 h-full lg:h-auto overflow-y-auto">
                {/* Filter heading */}
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-blue-600 font-bold">
                      Refine
                    </p>
                    <h2 className="text-xl font-bold text-gray-900">
                      Filters
                    </h2>
                  </div>

                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Search */}
                <div className="mb-7">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search
                  </label>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      placeholder="Book or author..."
                      className="
                        w-full
                        h-11
                        pl-10
                        pr-3
                        rounded-xl
                        border
                        border-gray-200
                        bg-gray-50
                        text-sm
                        outline-none
                        focus:bg-white
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-50
                      "
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-7">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>

                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="
                      w-full
                      h-11
                      px-3
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-50
                      text-sm
                      outline-none
                      focus:bg-white
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  >
                    <option value="">All Categories</option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="mb-7">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price Range
                  </label>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={filters.minPrice}
                        onChange={(e) =>
                          handleFilterChange("minPrice", e.target.value)
                        }
                        placeholder="Min"
                        className="
                          w-full
                          h-11
                          pl-7
                          pr-2
                          rounded-xl
                          border
                          border-gray-200
                          bg-gray-50
                          text-sm
                          outline-none
                          focus:bg-white
                          focus:border-blue-500
                        "
                      />
                    </div>

                    <span className="text-gray-300">—</span>

                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          handleFilterChange("maxPrice", e.target.value)
                        }
                        placeholder="Max"
                        className="
                          w-full
                          h-11
                          pl-7
                          pr-2
                          rounded-xl
                          border
                          border-gray-200
                          bg-gray-50
                          text-sm
                          outline-none
                          focus:bg-white
                          focus:border-blue-500
                        "
                      />
                    </div>
                  </div>
                </div>

                {/* Sort */}
                <div className="mb-7">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sort By
                  </label>

                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split("-")

                      setFilters((prev) => ({
                        ...prev,
                        sortBy,
                        sortOrder,
                        page: 1,
                      }))
                    }}
                    className="
                      w-full
                      h-11
                      px-3
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-50
                      text-sm
                      outline-none
                      focus:bg-white
                      focus:border-blue-500
                    "
                  >
                    <option value="created_at-desc">Newest First</option>
                    <option value="created_at-asc">Oldest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                  </select>
                </div>

                {/* Clear */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="
                      w-full
                      h-11
                      rounded-xl
                      border
                      border-blue-200
                      text-blue-600
                      font-semibold
                      text-sm
                      hover:bg-blue-50
                      transition-colors
                    "
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
              <div>
                <p className="text-sm text-blue-600 font-semibold mb-1">
                  {selectedCategory?.name || "Book Collection"}
                </p>

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {filters.search
                    ? `Results for "${filters.search}"`
                    : "Explore Our Books"}
                </h2>

                {pagination.total != null && (
                  <p className="text-sm text-gray-500 mt-2">
                    {pagination.total}{" "}
                    {pagination.total === 1 ? "book" : "books"} available
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Active filter count */}
                {hasActiveFilters && (
                  <span className="
                    hidden sm:inline-flex
                    items-center
                    px-3
                    py-2
                    rounded-full
                    bg-blue-50
                    text-blue-700
                    text-xs
                    font-semibold
                  ">
                    Filters applied
                  </span>
                )}

                {/* View mode */}
                <div className="flex items-center p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`
                      p-2
                      rounded-lg
                      transition-colors
                      ${
                        viewMode === "grid"
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }
                    `}
                    title="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setViewMode("list")}
                    className={`
                      p-2
                      rounded-lg
                      transition-colors
                      ${
                        viewMode === "list"
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }
                    `}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <BookSkeleton key={index} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "space-y-5"
                  }
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center mt-10">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handlePageChange(pagination.page - 1)
                        }
                        disabled={pagination.page === 1}
                        className="
                          p-2.5
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          text-gray-600
                          disabled:opacity-40
                          disabled:cursor-not-allowed
                          hover:border-blue-300
                          hover:text-blue-600
                        "
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      {Array.from(
                        { length: pagination.pages },
                        (_, i) => i + 1,
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`
                            min-w-10
                            h-10
                            px-3
                            rounded-xl
                            font-semibold
                            text-sm
                            transition-colors
                            ${
                              page === pagination.page
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                            }
                          `}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() =>
                          handlePageChange(pagination.page + 1)
                        }
                        disabled={pagination.page === pagination.pages}
                        className="
                          p-2.5
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          text-gray-600
                          disabled:opacity-40
                          disabled:cursor-not-allowed
                          hover:border-blue-300
                          hover:text-blue-600
                        "
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="
                bg-white
                border
                border-gray-100
                rounded-2xl
                p-12
                text-center
                shadow-sm
              ">
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

                <h3 className="text-xl font-bold text-gray-900">
                  No books found
                </h3>

                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  We couldn't find any books matching your current filters.
                  Try changing your search or category.
                </p>

                <button
                  onClick={clearFilters}
                  className="
                    mt-6
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
                  View All Books
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

const BookSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      <div className="aspect-[3/4] bg-gray-200" />

      <div className="p-5">
        <div className="h-5 bg-gray-200 rounded w-4/5 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-2/5 mb-5" />

        <div className="flex justify-between items-end">
          <div>
            <div className="h-6 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-14" />
          </div>

          <div className="h-11 w-11 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default Products