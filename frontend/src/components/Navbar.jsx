import { AppBar, Toolbar, Tabs, Tab, Container, Typography, Box } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'

const routes = ['/apod', '/mars', '/neo', '/media']

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const value = useMemo(() => {
    const idx = routes.findIndex(r => location.pathname.startsWith(r))
    return idx === -1 ? 0 : idx
  }, [location.pathname])

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'linear-gradient(90deg, #0f1530 0%, #12204a 60%, #163063 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(6px)'
      }}
    >
      <Toolbar disableGutters>
        <Container maxWidth={false} sx={{ display: 'flex', alignItems: 'center', gap: 4, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: '6px',
              background: 'radial-gradient(120% 120% at 30% 30%, #fff 0%, #89c7ff 40%, #1976d2 100%)',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.06)'
            }} />
            <Typography variant="h6" sx={{ letterSpacing: 0.4 }}>NASA Mission Control</Typography>
          </Box>

          <Tabs
            value={value}
            onChange={(_, v) => navigate(routes[v])}
            textColor="inherit"
            sx={{
              ml: { xs: 0, md: 2 },
              '& .MuiTabs-indicator': { height: 3, borderRadius: 2, background: '#FF6F00' }
            }}
            variant="scrollable"
            allowScrollButtonsMobile
          >
            <Tab label="APOD" />
            <Tab label="MARS" />
            <Tab label="NEO" />
            <Tab label="MEDIA" />
          </Tabs>

          <Box sx={{ flex: 1 }} />
        </Container>
      </Toolbar>
    </AppBar>
  )
}
