import React, { useEffect, useMemo, useState } from "react";
import { Apihelper } from "../../common/service/ApiHelper";

const statusColors = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

const Withdrawals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await Apihelper.listWithdrawals();
      const data = res.data?.data || [];
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (requests || []).filter((r) => {
      const user = r.userId || {};
      const matchesSearch =
        !query ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        String(user.phonenumber || "").toLowerCase().includes(query) ||
        String(r.accountNumber || "").toLowerCase().includes(query) ||
        String(r.ifscCode || "").toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, requests]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((filtered?.length || 0) / pageSize)), [filtered]);
  const pageStart = (page - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const currentRows = useMemo(() => (filtered || []).slice(pageStart, pageEnd), [filtered, pageStart, pageEnd]);

  const act = async (id, status) => {
    try {
      await Apihelper.updateWithdrawalStatus(id, status);
      await loadRequests();
    } catch (e) {
      console.error(e);
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this withdrawal request?')) return;
    try {
      await Apihelper.deleteWithdrawal(id);
      await loadRequests();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen py-8" style={{ background: "transparent" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="rounded-lg shadow-xl p-6 text-white"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h1
              className="text-3xl font-bold"
              style={{
                background: "linear-gradient(45deg, #4facfe, #00f2fe)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Withdrawal Requests
            </h1>
            <button
              onClick={loadRequests}
              className="px-4 py-2 rounded-md text-sm"
              style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(79, 172, 254, 0.4)" }}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone, AC or IFSC"
              className="w-full md:flex-1 px-4 py-2 rounded-md text-white focus:outline-none"
              style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(79, 172, 254, 0.4)" }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 px-4 py-2 rounded-md text-white focus:outline-none"
              style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(79, 172, 254, 0.4)" }}
            >
              <option className="bg-black" value="all">All</option>
              <option className="bg-black" value="pending">Pending</option>
              <option className="bg-black" value="approved">Approved</option>
              <option className="bg-black" value="rejected">Rejected</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">point</th>
                  <th className="px-4 py-3 text-left">Bank</th>
                  <th className="px-4 py-3 text-left">Account</th>
                  <th className="px-4 py-3 text-left">IFSC</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Requested</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((r) => {
                  const user = r.userId || {};
                  return (
                    <tr
                      key={r._id}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{user.name || "-"}</div>
                          <div className="text-sm text-gray-400">{user.email || "-"}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-300">{user.phonenumber || "-"}</div>
                      </td>
                      <td className="px-4 py-3">₹{r.points*7}</td>
                      <td className="px-4 py-3">{r.bankName}</td>
                      <td className="px-4 py-3 font-mono">{r.accountNumber}</td>
                      <td className="px-4 py-3 font-mono">{r.ifscCode}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[r.status] || "bg-gray-500"
                          } bg-opacity-20 text-white`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.requestedAt ? new Date(r.requestedAt).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          disabled={r.status !== "pending"}
                          onClick={() => act(r._id, "approved")}
                          className="px-3 py-1 rounded text-xs disabled:opacity-50"
                          style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)" }}
                        >
                          Approve
                        </button>
                        <button
                          disabled={r.status !== "pending"}
                          onClick={() => act(r._id, "rejected")}
                          className="px-3 py-1 rounded text-xs disabled:opacity-50"
                          style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => del(r._id)}
                          className="px-3 py-1 rounded text-xs"
                          style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-300">
              Showing {filtered.length === 0 ? 0 : pageStart + 1}–{Math.min(pageEnd, filtered.length)} of {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border border-white/30 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-300">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded border border-white/30 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400">No withdrawal requests found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;


