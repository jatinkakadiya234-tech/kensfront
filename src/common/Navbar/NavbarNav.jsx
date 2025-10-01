import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
// import { FaBars, FaTimes, FaSearch, FaUser } from 'react-icons/fa'
import { useMediaQuery } from 'react-responsive'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isMobile = useMediaQuery({ maxWidth: 768 })

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-red-300 bg-opacity-95 shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4 ">
          <Link to="/" className="text-2xl font-bold text-white flex items-center">
            <span className="text-primary-500">Fake</span>StreamVibe
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 bg-yellow-300 text-white rounded-xl p-3">
            <Link 
              to="/login" 
              className={`text-sm font-medium ${isActive('/login') ? 'text-red-700 bg-gray-900 p-3 rounded-xl'  : 'text-white hover:text-primary-400'}`}
            >
              Home
            </Link>
            <Link 
              to="/movies" 
              className={`text-sm font-medium ${isActive('/movies') ? 'text-primary-500' : 'text-white hover:text-primary-400'}`}
            >
              Movies
            </Link>
            <Link 
              to="/shows" 
              className={`text-sm font-medium ${isActive('/shows') ? 'text-primary-500' : 'text-white hover:text-primary-400'}`}
            >
              TV Shows
            </Link>
            <Link 
              to="/pricing" 
              className={`text-sm font-medium ${isActive('/pricing') ? 'text-primary-500' : 'text-white hover:text-primary-400'}`}
            >
              Pricing
            </Link>
          </div>

          {/* Search and Profile */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-white hover:text-primary-400">
              {/* <FaSearch /> */}
            </button>
            <button className="p-2 text-white hover:text-primary-400">
              {/* <FaUser /> */}
            </button>
            <button className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition duration-300">
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={toggleMobileMenu}>
            {/* {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />} */}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed top-0 right-0 h-full w-3/4 bg-dark-400 bg-opacity-95 p-6 transform transition-transform duration-300 ease-in-out z-50 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-end">
          <button className="text-white" onClick={closeMobileMenu}>
            {/* <FaTimes size={24} /> */}
          </button>
        </div>
        
        <div className="mt-8 flex flex-col space-y-6">
          <Link 
            to="/" 
            className={`text-lg font-medium ${isActive('/') ? 'text-primary-500' : 'text-white'}`}
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link 
            to="/movies" 
            className={`text-lg font-medium ${isActive('/movies') ? 'text-primary-500' : 'text-white'}`}
            onClick={closeMobileMenu}
          >
            Movies
          </Link>
          <Link 
            to="/shows" 
            className={`text-lg font-medium ${isActive('/shows') ? 'text-primary-500' : 'text-white'}`}
            onClick={closeMobileMenu}
          >
            TV Shows
          </Link>
          <Link 
            to="/pricing" 
            className={`text-lg font-medium ${isActive('/pricing') ? 'text-primary-500' : 'text-white'}`}
            onClick={closeMobileMenu}
          >
            Pricing
          </Link>
          <div className="border-t border-gray-700 pt-6">
            <button className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition duration-300 w-full">
              Sign In
            </button>
          </div>
        </div>
      </div>
      
      {/* Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        ></div>
      )}
    </nav>
  )
}

export default Navbar