export default function error(err, req, res, _next) {
  console.error('[ERROR]', err?.response?.status || '', err?.message);
  res.status(err?.response?.status || 500).json({
    message:
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      'Server error'
  });
}
