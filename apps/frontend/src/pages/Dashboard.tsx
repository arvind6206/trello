import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { orgAPI, boardAPI } from '../services/api';
import type { Organization, Board } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [boards, setBoards] = useState<Record<string, Board[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDesc, setNewOrgDesc] = useState('');
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const response = await orgAPI.getAll();
      setOrganizations(response.data.orgs);
      
      // Load boards for each organization
      const boardsData: Record<string, Board[]> = {};
      for (const org of response.data.orgs) {
        try {
          const boardsResponse = await boardAPI.getByOrg(org.id);
          boardsData[org.id] = boardsResponse.data.boards;
        } catch (err) {
          boardsData[org.id] = [];
        }
      }
      setBoards(boardsData);
    } catch (err: any) {
      setError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await orgAPI.create(newOrgName, newOrgDesc);
      setShowCreateOrg(false);
      setNewOrgName('');
      setNewOrgDesc('');
      loadOrganizations();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to create organization');
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrgId && newBoardTitle.trim()) {
      try {
        await boardAPI.create(selectedOrgId, newBoardTitle.trim());
        setShowCreateBoard(false);
        setNewBoardTitle('');
        setSelectedOrgId(null);
        loadOrganizations();
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to create board');
      }
    }
  };

  const openCreateBoardModal = (orgId: string) => {
    setSelectedOrgId(orgId);
    setShowCreateBoard(true);
  };

  const handleDeleteOrg = async (orgId: string) => {
    if (confirm('Are you sure you want to delete this organization?')) {
      try {
        await orgAPI.delete(orgId);
        loadOrganizations();
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to delete organization');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Trello</h1>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-sm">{user?.username?.[0]?.toUpperCase()}</span>
              </div>
              <span className="text-gray-700 font-medium">Welcome, {user?.username}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Create Organization Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateOrg(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Organization</span>
          </button>
        </div>

        {/* Create Organization Modal */}
        {showCreateOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create Organization</h2>
                <button
                  onClick={() => setShowCreateOrg(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateOrg} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                  <input
                    type="text"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter organization name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                  <textarea
                    value={newOrgDesc}
                    onChange={(e) => setNewOrgDesc(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                    rows={3}
                    placeholder="Describe your organization"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    Create Organization
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateOrg(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Board Modal */}
        {showCreateBoard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create Board</h2>
                <button
                  onClick={() => {
                    setShowCreateBoard(false);
                    setNewBoardTitle('');
                    setSelectedOrgId(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateBoard} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Board Name</label>
                  <input
                    type="text"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter board name"
                    required
                    autoFocus
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    Create Board
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateBoard(false);
                      setNewBoardTitle('');
                      setSelectedOrgId(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Organizations List */}
        {organizations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No organizations yet</h3>
            <p className="text-gray-600 mb-6">Create your first organization to get started with your boards</p>
          </div>
        ) : (
          <div className="space-y-8">
            {organizations.map((org) => (
              <div key={org.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-white">{org.orgname}</h2>
                      {org.description && (
                        <p className="text-indigo-100 mt-1 text-sm">{org.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteOrg(org.id)}
                      className="text-white hover:text-red-200 hover:bg-white/20 p-2 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Boards */}
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Boards</h3>
                    <button
                      onClick={() => openCreateBoardModal(org.id)}
                      className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Board</span>
                    </button>
                  </div>

                  {boards[org.id]?.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-gray-500 text-sm">No boards yet. Create your first board!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {boards[org.id]?.map((board) => (
                        <div
                          key={board.id}
                          onClick={() => navigate(`/board/${board.id}`)}
                          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 cursor-pointer hover:shadow-xl transition-all hover:scale-105 group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-semibold">{board.title}</h4>
                            <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white/60 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
