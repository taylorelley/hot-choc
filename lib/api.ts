const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function fetchRatings() {
  const res = await fetch(`${API_URL}/api/ratings`)
  if (!res.ok) throw new Error('Failed to fetch ratings')
  return res.json()
}

export async function fetchRating(id: string) {
  const res = await fetch(`${API_URL}/api/ratings/${id}`)
  if (!res.ok) throw new Error('Failed to fetch rating')
  return res.json()
}

export async function createRating(token: string, rating: any) {
  const res = await fetch(`${API_URL}/api/ratings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(rating),
  })
  if (!res.ok) throw new Error('Failed to save rating')
  return res.json()
}

export async function deleteRating(token: string, id: string) {
  const res = await fetch(`${API_URL}/api/ratings/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to delete rating')
}
