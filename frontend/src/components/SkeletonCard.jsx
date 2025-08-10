import { Card, CardContent, Skeleton, Box } from '@mui/material'

export function SkeletonCard({ lines = 2 }) {
  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={160} />
      <CardContent>
        {[...Array(lines)].map((_, i) => (
          <Box key={i} sx={{ mb: i === lines - 1 ? 0 : 1 }}>
            <Skeleton width={i ? '60%' : '80%'} />
          </Box>
        ))}
      </CardContent>
    </Card>
  )
}
