import React, { useState } from 'react';

type AuctionItemProps = {
  id: number;
  title: string;
  description: string;
  currentBid: number;
  onBid: (id: number, amount: number) => void;
};

const AuctionItem: React.FC<AuctionItemProps> = ({ id, title, description, currentBid, onBid }) => {
  const [bid, setBid] = useState(currentBid + 1);

  const handleBid = () => {
    if (bid > currentBid) {
      onBid(id, bid);
    }
  };

  return (
    <div className="auction-item" style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16 }}>
      <h2>{title}</h2>
      <p>{description}</p>
      <p>Current Bid: ${currentBid}</p>
      <input
        type="number"
        min={currentBid + 1}
        value={bid}
        onChange={e => setBid(Number(e.target.value))}
      />
      <button onClick={handleBid}>Place Bid</button>
    </div>
  );
};

export default AuctionItem;