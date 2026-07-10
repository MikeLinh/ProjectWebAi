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
import CheckoutSuccessPage from './pages/CheckoutSuccessPage'
import AdminLayout from "./admin/pages/AdminLayout";
import { AdminRoute, PrivateRoute } from "./components/private/protectedroute";
import { AuthProvider } from './components/context/authcontext'
import Profile from './pages/Profiles'
import ReviewPage from './pages/ReviewPage'
import About from './pages/About'
import Sale from './pages/Sale'

import VNPayReturn from './pages/VnpayReturn'

function App() {
  const ClientID = import.meta.env.VITE_GOOGLE_ID as string;
  return (

    <GoogleOAuthProvider clientId={ClientID}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />}/>
              <Route path="/about" element={<About />}/>
              <Route path="/sale" element={<Sale />}/>
              <Route path="/profile" element={<Profile />}/>
              <Route path="/product" element={<Product />}/>
              <Route path="/login" element={<Login />}/>
              <Route path="/review" element={<ReviewPage productId={0} />}/>
              <Route path="/forgotpassword" element={<ForgotPassword />}/>
              <Route path="/register" element={<Register />}/>
              <Route path="/product/:id" element={<ProductDetail />}/>
              <Route path="/cart" element={<CartPage />}/>
              <Route path="/checkout" element={<CheckoutPage />}/>
              <Route path="/checkout/success" element={<PrivateRoute><CheckoutSuccessPage /></PrivateRoute>}/>
              <Route path="/vnpay-return" element={<VNPayReturn />} />
              <Route path="/order-tracking" element={<PrivateRoute><OrderTrackingPage /></PrivateRoute>}/>
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>
        } />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  )

}

export default App