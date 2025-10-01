import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    } catch (error) {
      // Fallback for older browsers
      window.scrollTo(0, 0)
    }
  }, [location.pathname])

  return null
}

export default ScrollToTop


