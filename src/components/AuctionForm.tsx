import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createAuction, getCategories } from '../api/ApiHelper';

type AuctionFormProps = {
  onCreated: () => void;
};

const AuctionForm = ({ onCreated }: AuctionFormProps) => {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchCategories = async () => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });
      const cats = await getCategories(token);
      setCategories(cats);
    };
    fetchCategories();
  }, [getAccessTokenSilently]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('You must be logged in to create an auction.');
      return;
    }
    setLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });
      
      if (!user?.sub) {
  alert('User ID is missing.');
  setLoading(false);
  return;
}
      await createAuction(
        {
          title,
          description,
          startingPrice: Number(startingPrice),
          categoryId,
          userId: user?.sub, 
        },
        token
      );
      setTitle('');
      setDescription('');
      setStartingPrice('');
      setCategoryId('');
      onCreated();
    } catch (err) {
      alert('Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h3>Create Auction</h3>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Starting Price"
        value={startingPrice}
        onChange={e => setStartingPrice(e.target.value)}
        required
      />
      <select
        value={categoryId}
        onChange={e => setCategoryId(e.target.value)}
        required
      >
        <option value="">Select Category</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
};

export default AuctionForm;