export interface Auction {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  categoryId: string;
  categoryName?: string; // Optional, for display purposes
  userId: string; // User ID of the auction creator
  startTime: string; // ISO string
  endTime: string;   // ISO string
}