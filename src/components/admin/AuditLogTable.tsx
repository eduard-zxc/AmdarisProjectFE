import { useEffect, useState } from "react";
import { fetchAuditLogs } from "../../api/auditlogs";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TablePagination,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { useAuth } from "../auth/AuthProvider";

export default function AuditLogTable() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const { getAccessTokenSilently } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getAccessTokenSilently();
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }
        const data = await fetchAuditLogs(token, page + 1, pageSize);
        setLogs(data.items ?? data);
        setTotal(data.total ?? 0);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, pageSize, getAccessTokenSilently]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  return (
    <Paper sx={{ width: "100%", overflow: "auto" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Timestamp</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Target</TableCell>
            <TableCell>Target Type</TableCell>
            <TableCell>Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log: any) => (
            <TableRow key={log.id}>
              <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
              <TableCell>{log.userId}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>{log.targetId}</TableCell>
              <TableCell>{log.targetType}</TableCell>
              <TableCell>{log.details}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => {
          setPageSize(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </Paper>
  );
}
