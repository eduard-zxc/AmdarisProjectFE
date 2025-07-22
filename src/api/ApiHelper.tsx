import type { Auction } from "../types/Auction";

const API_URL = "http://localhost:5188/api";

export async function uploadAuctionImage(
  auctionId: string,
  file: File,
  token: string
) {
  console.log("Uploading image for auction:", auctionId, "File:", file);
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/images/${auctionId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload image");
  console.log("Image uploaded successfully:", res);
  return res.json();
}

export async function createAuction(
  auction: Omit<Auction, "id">,
  token: string
) {
  const res = await fetch(`${API_URL}/auctions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(auction),
  });
  if (!res.ok) throw new Error("Failed to create auction");
  return res.json();
}

export async function updateAuction(
  id: string,
  auction: Partial<Auction>,
  token: string
) {
  const payload = {
    ...auction,
    id,
  };

  const res = await fetch(`${API_URL}/auctions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update auction");
  if (res.status === 204) return;
  return res.json();
}

export async function deleteAuction(id: string, token: string) {
  const res = await fetch(`${API_URL}/auctions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete auction");
}

export async function getAuctions(params: any = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    if (key === "status" && value && typeof value === "object") {
      const statusObj = value as { active?: boolean; ended?: boolean };
      if (statusObj.active) query.append("active", "true");
      if (statusObj.ended) query.append("ended", "true");
    } else {
      query.append(key, value != null ? value.toString() : "");
    }
  });
  const res = await fetch(`${API_URL}/auctions?${query.toString()}`);
  return await res.json();
}

export async function getCategories() {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function ensureUserExists(token: string) {
  const res = await fetch(`${API_URL}/users/me`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to ensure user exists");
  return res.json();
}

export async function getMyBids(token: string) {
  const res = await fetch(`${API_URL}/users/bids`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch bids");
  return res.json();
}

export async function getMyWonAuctions(token: string) {
  const res = await fetch(`${API_URL}/users/won-auctions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch won auctions");
  return res.json();
}

export async function getMySellingHistory(token: string) {
  const res = await fetch(`${API_URL}/users/selling-history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch selling history");
  return res.json();
}

export async function placeBid(
  bid: { auctionId: string; amount: number; userId: string },
  token: string
) {
  const res = await fetch(`${API_URL}/bids`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bid),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to place bid");
  }
  return res.json();
}

export async function getAuctionById(id: string, token: string) {
  const res = await fetch(`${API_URL}/auctions/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch auction");
  return res.json();
}
