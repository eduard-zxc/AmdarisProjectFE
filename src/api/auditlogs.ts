const API_URL = "http://localhost:5188/api";

export async function fetchAuditLogs(token: string, page = 1, pageSize = 20) {
  const res = await fetch(
    `${API_URL}/auditlogs?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return res.json();
}
