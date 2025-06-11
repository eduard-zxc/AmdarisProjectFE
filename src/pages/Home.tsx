import React, { useState } from 'react';
import AuctionItem from '../components/AuctionItem';

type Item = {
  id: number;
  title: string;
  description: string;
  currentBid: number;
};

const initialItems: Item[] = [
  { id: 1, title: 'Vintage Clock', description: 'A beautiful old clock.', currentBid: 50 },
  { id: 2, title: 'Antique Vase', description: 'Rare porcelain vase.', currentBid: 120 },
];

const Home: React.FC = () => {
  const [items, setItems] = useState<Item[]>(initialItems);

  const handleBid = (id: number, amount: number) => {
    setItems(items =>
      items.map(item =>
        item.id === id && amount > item.currentBid
          ? { ...item, currentBid: amount }
          : item
      )
    );
  };

  return (
    <div>
      <h1>Online Auction</h1>
      {items.map(item => (
        <AuctionItem key={item.id} {...item} onBid={handleBid} />
      ))}
    </div>
  );
};

export default Home;