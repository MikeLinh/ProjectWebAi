import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Product from './pages/Product'
import Login from "./pages/Login"
import ProductDetail from "./pages/Productdetail"
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import { CartProvider } from './components/context/carcontext'
import { GoogleOAuthProvider } from "@react-oauth/google"
import OrderTrackingPage from './pages/OrderTracking'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

function App() {
  const ClientID = import.meta.env.VITE_GOOGLE_ID as string;
  return (
    <GoogleOAuthProvider clientId={ClientID}>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />}/>
              <Route path="/product" element={<Product />}/>
              <Route path="/login" element={<Login />}/>
              <Route path="/forgotpassword" element={<ForgotPassword />}/>
              <Route path="/register" element={<Register />}/>
              <Route path="/product/:id" element={<ProductDetail />}/>
              <Route path="/cart" element={<CartPage />}/>
              <Route path="/checkout" element={<CheckoutPage />}/>
              <Route path="/ordertracking" element={<OrderTrackingPage />}/>
            </Routes>
          </Router>
        </CartProvider>
    </GoogleOAuthProvider>
  )

}

export default App