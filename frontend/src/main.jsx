import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { theme } from './theme'
import App from './App.jsx'
import './index.css'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useEffect } from 'react'
import { useIsFetching } from '@tanstack/react-query'
import { useNavigationType, useLocation } from 'react-router-dom'

NProgress.configure({ showSpinner: false, trickleSpeed: 120 })

function GlobalLoadingBar() {
  const isFetching = useIsFetching()
  const navType = useNavigationType()
  const location = useLocation()

  useEffect(() => {
    NProgress.start()
    return () => {
      NProgress.done()
    }
  }, [navType, location.key])

  useEffect(() => {
    if (isFetching) NProgress.start()
    else NProgress.done()
  }, [isFetching])

  return null
}

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60_000,  
      gcTime: 10 * 60_000,
      retry: (failureCount, error) => {
        const status = error?.response?.status
        if ([400, 401, 403, 404].includes(status)) return false
        return failureCount < 2
      }
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <GlobalLoadingBar />
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
