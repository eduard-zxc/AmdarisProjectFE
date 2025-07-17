import { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
} from "@mui/material";

export default function AuctionList() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/auctions`)
      .then((res) => res.json())
      .then((data) => {
        setAuctions(data.items);
        setLoading(false);
      });
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>Category</TableCell>
          <TableCell>Owner</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {auctions.map((a) => (
          <TableRow key={a.id}>
            <TableCell>{a.title}</TableCell>
            <TableCell>{a.categoryName ?? "-"}</TableCell>
            <TableCell>{a.ownerEmail ?? "-"}</TableCell>
            <TableCell>
              {new Date(a.endTime) > new Date() ? "Active" : "Ended"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
