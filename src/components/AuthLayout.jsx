import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

export default function Protected({ children, authentication = true }) {
  const navigate = useNavigate()
  const authStatus = useSelector(state => state.auth.status)
  const [loader, setLoader] = useState(true)

  useEffect(() => {
    if (authStatus === null) return

    if (authentication && authStatus === false) {
      navigate("/login", { replace: true })
    }

    if (!authentication && authStatus === true) {
      navigate("/", { replace: true })
    }

    setLoader(false)
  }, [authStatus, authentication, navigate])

  if (loader) return null

  return <>{children}</>
}
