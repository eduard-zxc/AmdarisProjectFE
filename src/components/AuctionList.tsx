import { useEffect, useState } from 'react';
import { getAuctions, deleteAuction } from '../api/ApiHelper';
import type { Auction } from '../types/Auction';
import { useAuth0 } from '@auth0/auth0-react';

export default function AuctionList() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    const fetchAuctions = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
       const token = await getAccessTokenSilently(
      {
  authorizationParams: {
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      }
    );
      const data = await getAuctions(token);
      setAuctions(data.items || []);
      setLoading(false);
    };
    fetchAuctions();
  }, [getAccessTokenSilently, isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (!isAuthenticated) {
      alert('You must be logged in to delete an auction.');
      return;
    }
     const token = await getAccessTokenSilently(
      {
  authorizationParams: {
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      }
    );
    await deleteAuction(id, token);
    setAuctions(auctions.filter(a => a.id !== id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Auctions</h2>
      <ul>
        {auctions.map(a => (
          <li key={a.id}>
            <strong>{a.title}</strong> - {a.description} (${a.startingPrice})
            <button onClick={() => handleDelete(a.id)} style={{marginLeft: 8}}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}