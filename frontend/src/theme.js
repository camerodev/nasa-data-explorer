import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1976d2' },
    secondary: { main: '#FF6F00' },
    background: {
      default: '#0b0f19',  
      paper: '#1a1f2b'     
    },
    text: { primary: '#e6e9f5', secondary: '#b9c0d9' }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: 'rgba(255,255,255,0.32)' },
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#90caf9' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#42a5f5' }
        }
      }
    },

    MuiSvgIcon: {
      styleOverrides: {
        root: { color: 'rgba(255,255,255,0.72)' }
      }
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          borderRadius: 12,                      
          backgroundClip: 'padding-box',         
        }
      }
    },

    MuiPaginationItem: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(255,255,255,0.12)',
          '&.Mui-selected': {
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderColor: 'rgba(255,255,255,0.24)'
          }
        }
      }
    }
  }
});
