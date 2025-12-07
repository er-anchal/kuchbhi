import React, { useState, useEffect } from 'react'
import Home from './views/Home.jsx'
import Signup from './views/Signup.jsx'
import Login from './views/Login.jsx'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'

const App = () => {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </div>

  )
}

export default App