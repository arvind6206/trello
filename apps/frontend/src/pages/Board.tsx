import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, type DropResult, Droppable, Draggable } from '@hello-pangea/dnd';
import { boardAPI, sectionAPI, issueAPI } from '../services/api';
import { websocketService } from '../services/websocket';
import type { Board, Section, Issue } from '../types';

const BoardView: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [issues, setIssues] = useState<Record<string, Issue[]>>({});
  const [loading, setLoading] = useState(true);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showAddIssue, setShowAddIssue] = useState<string | null>(null);
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [newIssueDesc, setNewIssueDesc] = useState('');
  const [error, setError] = useState('');
  const [connectedUsers, setConnectedUsers] = useState<number[]>([]);
  const [showEditIssue, setShowEditIssue] = useState<string | null>(null);
  const [editIssueTitle, setEditIssueTitle] = useState('');
  const [editIssueDesc, setEditIssueDesc] = useState('');
  const [showEditSection, setShowEditSection] = useState<string | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');

  useEffect(() => {
    if (boardId) {
      loadBoard();
      loadSections();
      loadIssues();
      websocketService.connect(boardId);

      const unsubscribe = websocketService.onMessage((message) => {
        if (message.type === 'join') {
          setConnectedUsers((prev) => [...prev, message.userId!]);
        } else if (message.type === 'leave') {
          setConnectedUsers((prev) => prev.filter((id) => id !== message.userId));
        } else if (message.type === 'initial_state') {
          setConnectedUsers(message.users || []);
        }
      });

      return () => {
        unsubscribe();
        websocketService.disconnect();
      };
    }
  }, [boardId]);

  const loadBoard = async () => {
    try {
      const response = await boardAPI.getSingle(boardId!);
      setBoard(response.data.board);
    } catch (err) {
      setError('Failed to load board');
    }
  };

  const loadSections = async () => {
    try {
      const response = await sectionAPI.getByBoard(boardId!);
      setSections(response.data.sections);
    } catch (err) {
      setError('Failed to load sections');
    }
  };

  const loadIssues = async () => {
    try {
      const response = await issueAPI.getByBoard(boardId!);
      const issuesBySection: Record<string, Issue[]> = {};
      response.data.issues.forEach((issue: Issue) => {
        if (!issuesBySection[issue.sectionId]) {
          issuesBySection[issue.sectionId] = [];
        }
        issuesBySection[issue.sectionId].push(issue);
      });
      // Sort issues by position
      Object.keys(issuesBySection).forEach((sectionId) => {
        issuesBySection[sectionId].sort((a, b) => a.position - b.position);
      });
      setIssues(issuesBySection);
    } catch (err) {
      setError('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sectionAPI.create(boardId!, newSectionTitle);
      setNewSectionTitle('');
      setShowAddSection(false);
      loadSections();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to create section');
    }
  };

  const handleAddIssue = async (e: React.FormEvent, sectionId: string) => {
    e.preventDefault();
    try {
      await issueAPI.create(newIssueTitle, newIssueDesc, boardId!, sectionId);
      setNewIssueTitle('');
      setNewIssueDesc('');
      setShowAddIssue(null);
      loadIssues();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to create issue');
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      try {
        await sectionAPI.delete(sectionId);
        loadSections();
        loadIssues();
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to delete section');
      }
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (confirm('Are you sure you want to delete this issue?')) {
      try {
        await issueAPI.delete(issueId);
        loadIssues();
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to delete issue');
      }
    }
  };

  const handleEditIssue = async (issueId: string) => {
    const issue = Object.values(issues).flat().find(i => i.id === issueId);
    if (issue) {
      setEditIssueTitle(issue.title);
      setEditIssueDesc(issue.description || '');
      setShowEditIssue(issueId);
    }
  };

  const handleUpdateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showEditIssue) {
      try {
        await issueAPI.update(showEditIssue, editIssueTitle, editIssueDesc);
        setShowEditIssue(null);
        setEditIssueTitle('');
        setEditIssueDesc('');
        loadIssues();
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to update issue');
      }
    }
  };

  const handleEditSection = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setEditSectionTitle(section.title);
      setShowEditSection(sectionId);
    }
  };

  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showEditSection) {
      try {
        await sectionAPI.update(showEditSection, editSectionTitle);
        setShowEditSection(null);
        setEditSectionTitle('');
        loadSections();
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to update section');
      }
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Handle reordering within the same section
    if (destination.droppableId === source.droppableId) {
      const sectionIssues = [...issues[source.droppableId]];
      const [reorderedItem] = sectionIssues.splice(source.index, 1);
      sectionIssues.splice(destination.index, 0, reorderedItem);

      // Update positions
      sectionIssues.forEach((issue, index) => {
        issue.position = index;
      });

      setIssues({
        ...issues,
        [source.droppableId]: sectionIssues,
      });

      // Note: You would need to add an API endpoint to update issue positions
      // For now, this is just visual reordering
    } else {
      // Handle moving between sections
      const sourceIssues = [...issues[source.droppableId]];
      const destIssues = issues[destination.droppableId] ? [...issues[destination.droppableId]] : [];
      const [movedItem] = sourceIssues.splice(source.index, 1);
      
      movedItem.sectionId = destination.droppableId;
      destIssues.splice(destination.index, 0, movedItem);

      // Update positions
      sourceIssues.forEach((issue, index) => {
        issue.position = index;
      });
      destIssues.forEach((issue, index) => {
        issue.position = index;
      });

      setIssues({
        ...issues,
        [source.droppableId]: sourceIssues,
        [destination.droppableId]: destIssues,
      });

      // Note: You would need to add an API endpoint to update issue section and positions
      // For now, this is just visual reordering
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading board...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{board?.title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {connectedUsers.map((userId, index) => (
                <div
                  key={index}
                  className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                >
                  {userId.toString().slice(0, 2)}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-600">{connectedUsers.length} online</span>
          </div>
        </div>
      </header>

      {/* Board Content */}
      <main className="p-6 bg-gray-100 min-h-screen">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 max-w-7xl mx-auto">
            {error}
          </div>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-4 overflow-x-auto pb-4 px-2">
            {sections.map((section) => (
              <div key={section.id} className="flex-shrink-0 w-80">
                <Droppable droppableId={section.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-gray-100 rounded-xl p-4 shadow-sm ${
                        snapshot.isDraggingOver ? 'bg-gray-200 ring-2 ring-indigo-300' : ''
                      } transition-all`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <h3 
                            onClick={() => handleEditSection(section.id)}
                            className="font-semibold text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors"
                          >
                            {section.title}
                          </h3>
                          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {issues[section.id]?.length || 0}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditSection(section.id)}
                            className="text-gray-400 hover:text-indigo-500 transition-colors p-1 hover:bg-indigo-50 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 min-h-[100px]">
                        {issues[section.id]?.map((issue, index) => (
                          <Draggable key={issue.id} draggableId={issue.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg p-4 shadow-sm cursor-grab hover:shadow-md transition-all border border-gray-100 ${
                                  snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-400' : ''
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <h4 
                                    onClick={() => handleEditIssue(issue.id)}
                                    className="font-medium text-gray-800 text-sm flex-1 cursor-pointer hover:text-indigo-600 transition-colors"
                                  >
                                    {issue.title}
                                  </h4>
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => handleEditIssue(issue.id)}
                                      className="text-gray-400 hover:text-indigo-500 transition-colors p-1 hover:bg-indigo-50 rounded"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteIssue(issue.id)}
                                      className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                {issue.description && (
                                  <p className="text-gray-600 text-xs mt-2 line-clamp-2">{issue.description}</p>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>

                      <button
                        onClick={() => setShowAddIssue(section.id)}
                        className="w-full mt-4 text-gray-500 hover:text-gray-700 hover:bg-gray-200 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center space-x-2 group"
                      >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Issue</span>
                      </button>

                      {showAddIssue === section.id && (
                        <form onSubmit={(e) => handleAddIssue(e, section.id)} className="mt-4 space-y-3 bg-white p-3 rounded-lg shadow-sm">
                          <input
                            type="text"
                            placeholder="Issue title"
                            value={newIssueTitle}
                            onChange={(e) => setNewIssueTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                            required
                            autoFocus
                          />
                          <textarea
                            placeholder="Description (optional)"
                            value={newIssueDesc}
                            onChange={(e) => setNewIssueDesc(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-none"
                            rows={2}
                          />
                          <div className="flex space-x-2">
                            <button
                              type="submit"
                              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              Add Issue
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowAddIssue(null)}
                              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {showEditIssue && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                              <h2 className="text-xl font-bold text-gray-800">Edit Issue</h2>
                              <button
                                onClick={() => {
                                  setShowEditIssue(null);
                                  setEditIssueTitle('');
                                  setEditIssueDesc('');
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <form onSubmit={handleUpdateIssue} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                  type="text"
                                  value={editIssueTitle}
                                  onChange={(e) => setEditIssueTitle(e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                                  required
                                  autoFocus
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                                <textarea
                                  value={editIssueDesc}
                                  onChange={(e) => setEditIssueDesc(e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-none"
                                  rows={3}
                                />
                              </div>
                              <div className="flex space-x-3">
                                <button
                                  type="submit"
                                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all"
                                >
                                  Update Issue
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowEditIssue(null);
                                    setEditIssueTitle('');
                                    setEditIssueDesc('');
                                  }}
                                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}

                      {showEditSection && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                              <h2 className="text-xl font-bold text-gray-800">Edit Section</h2>
                              <button
                                onClick={() => {
                                  setShowEditSection(null);
                                  setEditSectionTitle('');
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <form onSubmit={handleUpdateSection} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Section Name</label>
                                <input
                                  type="text"
                                  value={editSectionTitle}
                                  onChange={(e) => setEditSectionTitle(e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                                  required
                                  autoFocus
                                />
                              </div>
                              <div className="flex space-x-3">
                                <button
                                  type="submit"
                                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all"
                                >
                                  Update Section
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowEditSection(null);
                                    setEditSectionTitle('');
                                  }}
                                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}

            {/* Add Section Card */}
            <div className="flex-shrink-0 w-80">
              <div className="bg-gray-100 rounded-xl p-4 shadow-sm">
                {!showAddSection ? (
                  <button
                    onClick={() => setShowAddSection(true)}
                    className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-200 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center space-x-2 group"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Section</span>
                  </button>
                ) : (
                  <form onSubmit={handleAddSection} className="space-y-3 bg-white p-3 rounded-lg shadow-sm">
                    <input
                      type="text"
                      placeholder="Section title"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                      required
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Add Section
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddSection(false)}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </DragDropContext>
      </main>
    </div>
  );
};

export default BoardView;
