import React, { useState } from 'react';

// Static trial data for testing
const staticTrials = [
  {
    _id: '1',
    userid: {
      _id: 'u1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    movieUrl: 'https://example.com/movie1.mp4',
    status: 'pending',
    requestedAt: new Date('2024-03-15'),
  },
  {
    _id: '2',
    userid: {
      _id: 'u2',
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    movieUrl: 'https://example.com/movie2.mp4',
    status: 'accepted',
    requestedAt: new Date('2024-03-14'),
  },
  {
    _id: '3',
    userid: {
      _id: 'u3',
      name: 'Mike Johnson',
      email: 'mike@example.com'
    },
    movieUrl: 'https://example.com/movie3.mp4',
    status: 'rejected',
    requestedAt: new Date('2024-03-13'),
  }
];

const Trials = () => {
  const [trials, setTrials] = useState(staticTrials);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter trials based on search term and status
  const filteredTrials = trials.filter(trial => {
    const matchesSearch = 
      trial.userid.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trial.userid.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trial.movieUrl.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || trial.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAccept = (trialId) => {
    setTrials(trials.map(trial => 
      trial._id === trialId ? { ...trial, status: 'accepted' } : trial
    ));
  };

  const handleReject = (trialId) => {
    setTrials(trials.map(trial => 
      trial._id === trialId ? { ...trial, status: 'rejected' } : trial
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
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
            Trial Requests
          </h1>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email or movie URL..."
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
                <option value="pending" className="bg-black">Pending</option>
                <option value="accepted" className="bg-black">Accepted</option>
                <option value="rejected" className="bg-black">Rejected</option>
              </select>
            </div>
          </div>

          {/* Trials Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Movie URL</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Requested Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrials.map((trial) => (
                  <tr 
                    key={trial._id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{trial.userid.name}</div>
                        <div className="text-sm text-gray-400">{trial.userid.email}</div>
                        <div className="text-xs text-gray-500">ID: {trial.userid._id}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a 
                        href={trial.movieUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline"
                        style={{ color: '#4facfe' }}
                      >
                        {trial.movieUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trial.status)} bg-opacity-20 text-white`}>
                        {trial.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(trial.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {trial.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(trial._id)}
                            className="px-3 py-1 bg-green-500 bg-opacity-20 hover:bg-opacity-30 text-green-400 rounded-md transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(trial._id)}
                            className="px-3 py-1 bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-400 rounded-md transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTrials.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No trial requests found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trials; 