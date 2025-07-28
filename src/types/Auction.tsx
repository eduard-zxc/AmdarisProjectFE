import type { AuctionImage } from "./AuctionImage";
import type { Bid } from "./Bid";

export interface Auction {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  categoryId: string;
  categoryName?: string;
  startTime: string;
  endTime: string;
  // userId: string;
  winnerId?: string | null;
  bids: Bid[];
  images: AuctionImage[];
}
