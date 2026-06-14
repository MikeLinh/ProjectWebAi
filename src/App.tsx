import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Product from './pages/Product'
import Login from "./pages/Login"
import ProductDetail from "./pages/Productdetail"
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import { CartProvider } from './components/context/carcontext'



function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />}/>
          <Route path="/product" element={<Product />}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/product/:id" element={<ProductDetail />}/>
          <Route path="/cart" element={<CartPage />}/>
          <Route path="/checkout" element={<CheckoutPage />}/>
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App