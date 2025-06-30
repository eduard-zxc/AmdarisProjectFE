export interface Auction {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  categoryId: string;
  categoryName?: string; 
  startTime: string; 
  endTime: string;   
}