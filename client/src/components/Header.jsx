"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  BookOpen,
  Package,
  Shield,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const { getCartItemsCount } = useCart()
  const navigate = useNavigate()

  const cartCount = isAuthenticated ? getCartItemsCount() : 0

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleSearch = (e) => {
    e.preventDefault()

    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setIsMenuOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-blue-100 shadow-sm">
      {/* Top accent */}
      <div className="h-1 bg-blue-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[76px] flex items-center justify-between gap-6">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center shrink-0 group"
            onClick={() => setIsMenuOpen(false)}
          >
            <img
              src="/bookStore.png"
              alt="Bookstore"
              className="h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:block flex-1 max-w-xl"
          >
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5
                           text-gray-400 group-focus-within:text-blue-600
                           transition-colors"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books, authors..."
                className="
                  w-full
                  h-11
                  pl-12
                  pr-4
                  rounded-full
                  border border-gray-200
                  bg-gray-50
                  text-gray-800
                  placeholder-gray-400
                  outline-none
                  transition-all
                  focus:bg-white
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-50
                "
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">

            <Link
              to="/products"
              className="
                flex items-center gap-2
                px-3 py-2
                rounded-lg
                text-gray-700
                font-medium
                hover:text-blue-600
                hover:bg-blue-50
                transition-colors
              "
            >
              <BookOpen className="h-5 w-5" />
              <span>Books</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/orders"
                className="
                  flex items-center gap-2
                  px-3 py-2
                  rounded-lg
                  text-gray-700
                  font-medium
                  hover:text-blue-600
                  hover:bg-blue-50
                  transition-colors
                "
              >
                <Package className="h-5 w-5" />
                <span>Orders</span>
              </Link>
            )}

            {/* Account */}
            {isAuthenticated ? (
              <div className="relative group ml-1">
                <button
                  className="
                    flex items-center gap-2
                    px-3 py-2
                    rounded-lg
                    text-gray-700
                    font-medium
                    hover:text-blue-600
                    hover:bg-blue-50
                    transition-colors
                  "
                >
                  <User className="h-5 w-5" />

                  <span className="max-w-[100px] truncate">
                    {user?.first_name || "Account"}
                  </span>

                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Dropdown */}
                <div
                  className="
                    absolute right-0 top-full mt-2
                    w-52
                    rounded-xl
                    border border-gray-100
                    bg-white
                    shadow-xl
                    py-2
                    opacity-0
                    invisible
                    translate-y-1
                    group-hover:opacity-100
                    group-hover:visible
                    group-hover:translate-y-0
                    transition-all duration-200
                  "
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    className="
                      flex items-center gap-3
                      px-4 py-2.5
                      text-sm text-gray-700
                      hover:bg-blue-50
                      hover:text-blue-600
                    "
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="
                        flex items-center gap-3
                        px-4 py-2.5
                        text-sm text-gray-700
                        hover:bg-blue-50
                        hover:text-blue-600
                      "
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="
                      w-full
                      flex items-center gap-3
                      px-4 py-2.5
                      text-sm text-gray-700
                      hover:bg-red-50
                      hover:text-red-600
                    "
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="
                    px-3 py-2
                    text-gray-700
                    font-medium
                    hover:text-blue-600
                    transition-colors
                  "
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="
                    ml-1
                    px-5 py-2.5
                    rounded-full
                    bg-blue-600
                    text-white
                    font-semibold
                    shadow-sm
                    hover:bg-blue-700
                    hover:shadow-md
                    transition-all
                  "
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="
                relative
                ml-1
                p-2.5
                rounded-full
                text-gray-700
                hover:text-blue-600
                hover:bg-blue-50
                transition-colors
              "
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5.5 w-5.5" />

              {cartCount > 0 && (
                <span
                  className="
                    absolute -top-0.5 -right-0.5
                    min-w-5 h-5
                    px-1
                    rounded-full
                    bg-blue-600
                    text-white
                    text-[11px]
                    font-bold
                    flex items-center justify-center
                    border-2 border-white
                  "
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="
              md:hidden
              p-2.5
              rounded-lg
              text-gray-700
              hover:bg-blue-50
              hover:text-blue-600
              transition-colors
            "
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Search */}
        <form
          onSubmit={handleSearch}
          className="md:hidden pb-4"
        >
          <div className="relative">
            <Search
              className="
                absolute left-4 top-1/2
                -translate-y-1/2
                h-5 w-5
                text-gray-400
              "
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, authors..."
              className="
                w-full
                h-11
                pl-12
                pr-4
                rounded-full
                border border-gray-200
                bg-gray-50
                outline-none
                focus:bg-white
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-50
              "
            />
          </div>
        </form>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <nav className="flex flex-col gap-1">

              <Link
                to="/products"
                onClick={() => setIsMenuOpen(false)}
                className="
                  flex items-center gap-3
                  px-4 py-3
                  rounded-lg
                  text-gray-700
                  font-medium
                  hover:bg-blue-50
                  hover:text-blue-600
                "
              >
                <BookOpen className="h-5 w-5" />
                Books
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="
                      flex items-center gap-3
                      px-4 py-3
                      rounded-lg
                      text-gray-700
                      font-medium
                      hover:bg-blue-50
                      hover:text-blue-600
                    "
                  >
                    <Package className="h-5 w-5" />
                    Orders
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="
                      flex items-center gap-3
                      px-4 py-3
                      rounded-lg
                      text-gray-700
                      font-medium
                      hover:bg-blue-50
                      hover:text-blue-600
                    "
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="
                        flex items-center gap-3
                        px-4 py-3
                        rounded-lg
                        text-gray-700
                        font-medium
                        hover:bg-blue-50
                        hover:text-blue-600
                      "
                    >
                      <Shield className="h-5 w-5" />
                      Admin
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="
                      flex items-center gap-3
                      px-4 py-3
                      rounded-lg
                      text-left
                      text-gray-700
                      font-medium
                      hover:bg-red-50
                      hover:text-red-600
                    "
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="
                      px-4 py-3
                      rounded-lg
                      text-gray-700
                      font-medium
                      hover:bg-blue-50
                      hover:text-blue-600
                    "
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="
                      px-4 py-3
                      rounded-lg
                      bg-blue-600
                      text-white
                      font-semibold
                      text-center
                      hover:bg-blue-700
                    "
                  >
                    Sign Up
                  </Link>
                </>
              )}

              <Link
                to="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="
                  flex items-center justify-between
                  px-4 py-3
                  rounded-lg
                  text-gray-700
                  font-medium
                  hover:bg-blue-50
                  hover:text-blue-600
                "
              >
                <span className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5" />
                  Cart
                </span>

                <span className="text-sm text-gray-400">
                  {cartCount} items
                </span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header