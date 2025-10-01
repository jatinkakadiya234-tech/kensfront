import React, { useEffect, useState } from 'react';
import { Apihelper } from '../../common/service/ApiHelper';
const Orders = () => {
  const [orders, setOrders] = useState([]); // Start with empty array
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Fetch orders from backend
  async function Listorder() {
    try {
      const res = await Apihelper.Liastorder();
      console.log(res.data);
      setOrders(res.data || []);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    Listorder();
  }, []);

  // Reset to first page when filters or data change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, orders]);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const user = order.userid || {};
    const matchesSearch =
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
      (order.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) || "");
    const matchesStatus = statusFilter === 'all' || order.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil((filteredOrders?.length || 0) / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const currentOrders = filteredOrders.slice(pageStart, pageEnd);
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen py-8" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="rounded-lg shadow-xl p-6 text-white" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h1 className="text-3xl font-bold mb-6" style={{
            background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Orders Management
          </h1>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email or payment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-md text-white focus:outline-none"
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(79, 172, 254, 0.4)' }}
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto px-4 py-2 rounded-md text-white focus:outline-none"
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(79, 172, 254, 0.4)' }}
              >
                <option value="all" className="bg-black">All Status</option>
                <option value="completed" className="bg-black">Completed</option>
                <option value="pending" className="bg-black">Pending</option>
                <option value="failed" className="bg-black">Failed</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Payment ID</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-left">Expires</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => {
                  const user = order.userid || {};
                  return (
                    <tr 
                      key={order._id}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{user.name || '-'}</div>
                          <div className="text-sm text-gray-400">{user.email || '-'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize">{order.premiumType}</td>
                      <td className="px-4 py-3">₹{order.price}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono">{order._id || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)} bg-opacity-20 text-white`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {order.expiresAt ? new Date(order.expiresAt).toLocaleDateString() : '-'}
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
              Showing {filteredOrders.length === 0 ? 0 : pageStart + 1}–{Math.min(pageEnd, filteredOrders.length)} of {filteredOrders.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border border-white/30 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-300">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded border border-white/30 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No orders found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders; 