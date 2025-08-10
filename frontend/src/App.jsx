import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './components/Navbar.jsx'
import Apod from './pages/Apod.jsx'
import Mars from './pages/Mars.jsx'
import Neo from './pages/Neo.jsx'
import Media from './pages/Media.jsx'

export default function App() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(1200px 600px at 10% -10%, rgba(32,61,140,0.35), transparent 45%),' +
          'radial-gradient(1000px 500px at 110% 10%, rgba(255,111,0,0.18), transparent 40%),' +
          'linear-gradient(180deg, #0b1020 0%, #0b1020 100%)'
      }}
    >
      <Navbar />

      <Box
        component="main"
        sx={{
          width: '100%',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, md: 4 },
          maxWidth: '100%',           
          mx: 0
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/apod" replace />} />
          <Route path="/apod" element={<Apod />} />
          <Route path="/mars" element={<Mars />} />
          <Route path="/neo" element={<Neo />} />
          <Route path="/media" element={<Media />} />
        </Routes>
      </Box>
    </Box>
  )
}
