export const qk = {
  apod: (date) => ['apod', date],
  mars: (rover, date, camera, kind = 'page') => ['mars', rover, date, camera, kind],
  neo: (start, end) => ['neo', start, end],
  media: (q, page) => ['media', q, page],
}