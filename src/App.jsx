import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import './App.css'
import authService from "./appwrite/auth"
import {login, logout} from "./store/authSlice"
import { Footer, Header } from './components'
import { Outlet } from 'react-router-dom'

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

useEffect(() => {
  let mounted = true;

  authService.getCurrentUser()
    .then(userData => {
      if (!mounted) return;

      if (userData) {
        dispatch(login({ userData }))
      } else {
        dispatch(logout())
      }
    })
    .finally(() => {
      if (mounted) setLoading(false)
    })

  return () => {
    mounted = false
  }
}, [])

useEffect(() => {
    authService.getCurrentUser()
      .then(user => {
        if (user) {
          dispatch(login(user))
        } else {
          dispatch(logout())
        }
      })
      .catch(() => {
        dispatch(logout())
      })
  }, [dispatch])


  return !loading ? (
    <div className='min-h-screen flex flex-wrap content-between bg-gray-400'>
      <div className='w-full block'>
        <Header />
        <main>
        <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  ) : null
}

export default App