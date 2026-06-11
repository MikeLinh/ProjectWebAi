import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Product from './pages/Product'
import Login from "./pages/Login";
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />}/>
        <Route path="/product" element={<Product />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/" element={<Home />}/>
      </Routes>
    </Router>
  )
}

export default App
