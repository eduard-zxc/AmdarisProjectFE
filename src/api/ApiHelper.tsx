import type { Auction } from '../types/Auction';

const API_URL = 'http://localhost:5188/api/auctions';

export async function createAuction(auction: Omit<Auction, 'id'>, token: string) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(auction),
  });
  if (!res.ok) throw new Error('Failed to create auction');
  return res.json();
}

export async function deleteAuction(id: string, token: string) {
  const res = await fetch(`http://localhost:5188/api/auctions/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to delete auction');
}

export async function getAuctions(token: string) {
  const res = await fetch('http://localhost:5188/api/auctions', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch auctions');
  return res.json();
}

export async function getCategories(token: string) {
  const res = await fetch('http://localhost:5188/api/categories', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}