import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Product from './pages/Product'
import Login from "./pages/Login"
import ProductDetail from "./pages/Productdetail"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />}/>
        <Route path="/product" element={<Product />}/>
        <Route path="/product/:id" element={<ProductDetail />}/>
        <Route path="/login" element={<Login />}/>
      </Routes>
    </Router>
  )
}

export default App