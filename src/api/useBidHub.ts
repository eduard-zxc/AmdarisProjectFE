import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

export function useBidHub(
  auctionId: string,
  onBidReceived: (bid: any) => void
) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5188/hubs/bid")
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveBid", (bid) => {
      onBidReceived(bid);
    });

    connection.start().then(() => {
      connection.invoke("JoinAuction", auctionId);
    });

    connectionRef.current = connection;

    return () => {
      if (connectionRef.current) {
        connectionRef.current.invoke("LeaveAuction", auctionId);
        connectionRef.current.stop();
      }
    };
  }, [auctionId, onBidReceived]);

  // Function to place a bid
  const placeBid = (amount: number, userId: string) => {
    connectionRef.current?.invoke("PlaceBid", auctionId, amount, userId);
  };

  return { placeBid };
}
