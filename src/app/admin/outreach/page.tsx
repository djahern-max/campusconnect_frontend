'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Users,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Send,
  MessageSquare,
  Linkedin,
  Phone,
  Filter,
  Plus
} from 'lucide-react';
import apiClient from '@/api/client';

interface OutreachStats {
  total_entities: number;
  not_contacted: number;
  contacted: number;
  registered: number;
  declined: number;
  no_response: number;
  conversion_rate: number;
  pending_followups: number;
}

interface OutreachRecord {
  id: number;
  entity_name: string;
  entity_type: string;
  entity_id: number;
  contact_name?: string;
  contact_title?: string;
  contact_email?: string;
  contact_phone?: string;
  linkedin_url?: string;
  status: string;
  last_contact_date?: string;
  last_contact_method?: string;
  contact_attempt_count: number;
  invitation_code_id?: number;
  invitation_sent_date?: string;
  next_follow_up_date?: string;
  follow_up_count: number;
  notes?: string;
  response_feedback?: string;
  registered_date?: string;
  registered_admin_id?: number;
  priority: string;
  tags?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface OutreachDetailModalProps {
  record: OutreachRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function OutreachDashboard() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [stats, setStats] = useState<OutreachStats | null>(null);
  const [outreach, setOutreach] = useState<OutreachRecord[]>([]);
  const [filteredOutreach, setFilteredOutreach] = useState<OutreachRecord[]>([]);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFollowUpsOnly, setShowFollowUpsOnly] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);

  // Modal state
  const [selectedRecord, setSelectedRecord] = useState<OutreachRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Apply filters
    let filtered = [...outreach];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showFollowUpsOnly) {
      filtered = filtered.filter(r =>
        r.next_follow_up_date && new Date(r.next_follow_up_date) <= new Date()
      );
    }

    setFilteredOutreach(filtered);
  }, [outreach, statusFilter, searchTerm, showFollowUpsOnly]);

  const fetchData = async () => {
    try {
      const token = useAuthStore.getState().token;

      if (!token) {
        console.error('No token found');
        return;
      }

      // Fetch stats
      const statsResponse = await fetch('http://localhost:8000/api/v1/admin/outreach/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch outreach records
      const outreachResponse = await fetch('http://localhost:8000/api/v1/admin/outreach?limit=500', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (outreachResponse.ok) {
        const outreachData = await outreachResponse.json();
        setOutreach(outreachData);
        setFilteredOutreach(outreachData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      not_contacted: 'bg-gray-100 text-gray-800',
      contacted: 'bg-blue-100 text-blue-800',
      follow_up_sent: 'bg-yellow-100 text-yellow-800',
      registered: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      no_response: 'bg-orange-100 text-orange-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'contacted':
      case 'follow_up_sent':
        return <Mail className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'normal':
        return 'border-l-4 border-blue-500';
      case 'low':
        return 'border-l-4 border-gray-300';
      default:
        return '';
    }
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading outreach dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Outreach & Marketing Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your institution and scholarship outreach efforts
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Entities"
              value={stats.total_entities}
              icon={<Users className="h-8 w-8 text-primary-600" />}
              subtitle={`${stats.not_contacted} not contacted`}
            />
            <StatsCard
              title="Contacted"
              value={stats.contacted}
              icon={<Mail className="h-8 w-8 text-blue-600" />}
              subtitle={`${stats.pending_followups} need follow-up`}
            />
            <StatsCard
              title="Registered"
              value={stats.registered}
              icon={<CheckCircle className="h-8 w-8 text-green-600" />}
              subtitle={`${stats.conversion_rate}% conversion`}
            />
            <StatsCard
              title="Conversion Rate"
              value={`${stats.conversion_rate}%`}
              icon={<TrendingUp className="h-8 w-8 text-purple-600" />}
              subtitle={`${stats.declined} declined`}
            />
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full md:w-auto">
              <Input
                placeholder="Search entities, contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="not_contacted">Not Contacted</option>
                <option value="contacted">Contacted</option>
                <option value="follow_up_sent">Follow-up Sent</option>
                <option value="registered">Registered</option>
                <option value="declined">Declined</option>
                <option value="no_response">No Response</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFollowUpsOnly(!showFollowUpsOnly)}
                style={{ minWidth: '180px' }}
              >
                <Clock className="h-4 w-4 mr-2" />
                {showFollowUpsOnly ? 'Total Outreach' : `Due Today (${stats?.pending_followups || 0})`}
              </Button>
            </div>
          </div>
        </div>

        {/* Selected Actions */}
        {selectedRecords.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-900 font-medium">
                {selectedRecords.length} selected
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Bulk Email
                </Button>
                <Button variant="secondary" size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitations
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRecords([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Outreach Records Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Outreach Records ({filteredOutreach.length})
              </h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/admin/outreach/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <input type="checkbox" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Entity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Last Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Attempts
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Method
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOutreach.map((record) => (
                    <tr
                      key={record.id}
                      className={`hover:bg-gray-50 cursor-pointer ${getPriorityColor(record.priority)}`}
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowDetailModal(true);
                      }}
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRecords.includes(record.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRecords([...selectedRecords, record.id]);
                            } else {
                              setSelectedRecords(selectedRecords.filter(id => id !== record.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{record.entity_name}</p>
                          <p className="text-sm text-gray-500">{record.entity_type}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          {record.contact_name && (
                            <p className="text-sm font-medium text-gray-900">{record.contact_name}</p>
                          )}
                          {record.contact_email && (
                            <p className="text-sm text-gray-500">{record.contact_email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {record.last_contact_date ? (
                          <div>
                            <p>{new Date(record.last_contact_date).toLocaleDateString()}</p>
                            {record.last_contact_method && (
                              <p className="text-xs text-gray-500 capitalize">{record.last_contact_method}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <span className="font-medium">{record.contact_attempt_count || 0}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2 text-sm text-gray-500">
                          {record.contact_email && (
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              Email
                            </span>
                          )}
                          {record.linkedin_url && (
                            <span className="flex items-center">
                              <Linkedin className="h-4 w-4 mr-1" />
                              LinkedIn
                            </span>
                          )}
                          {record.contact_phone && (
                            <span className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              Phone
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Detail Modal */}
      <OutreachDetailModal
        record={selectedRecord}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRecord(null);
        }}
        onUpdate={fetchData}
      />
    </div>
  );
}

// Outreach Detail Modal Component
function OutreachDetailModal({ record, isOpen, onClose, onUpdate }: OutreachDetailModalProps) {
  const token = useAuthStore((state) => state.token);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followUpNote, setFollowUpNote] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (record) {
      setNewStatus(record.status);
      // Set default follow-up date to 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setNextFollowUpDate(defaultDate.toISOString().split('T')[0]);
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleSubmitFollowUp = async () => {
    if (!followUpNote.trim()) {
      alert('Please add a follow-up note');
      return;
    }

    setIsSubmitting(true);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const newNote = `\n[${timestamp}] ${followUpNote}`;

      const response = await fetch(`http://localhost:8000/api/v1/admin/outreach/${record.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          notes: (record.notes || '') + newNote,
          next_follow_up_date: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : null
        })
      });

      if (response.ok) {
        setFollowUpNote('');
        onUpdate();
        onClose();
      } else {
        alert('Failed to update record');
      }
    } catch (err) {
      console.error('Failed to update:', err);
      alert('Error updating record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parse notes into timeline entries
  const timelineEntries = (record.notes || '').split('\n').filter(line => line.trim());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{record.entity_name}</h2>
              <p className="text-sm text-gray-500 mt-1 capitalize">{record.entity_type}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                {record.contact_name && (
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{record.contact_name}</span>
                  </div>
                )}
                {record.contact_title && (
                  <div>
                    <span className="text-gray-600">Title:</span>
                    <span className="ml-2 font-medium">{record.contact_title}</span>
                  </div>
                )}
                {record.contact_email && (
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{record.contact_email}</span>
                  </div>
                )}
                {record.contact_phone && (
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{record.contact_phone}</span>
                  </div>
                )}
                {record.linkedin_url && (
                  <div>
                    <span className="text-gray-600">LinkedIn:</span>
                    <a
                      href={record.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Outreach Status</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${record.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                    record.status === 'registered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                    {record.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Contact Attempts:</span>
                  <span className="ml-2 font-medium">{record.contact_attempt_count}</span>
                </div>
                <div>
                  <span className="text-gray-600">Last Contact:</span>
                  <span className="ml-2 font-medium">
                    {record.last_contact_date
                      ? new Date(record.last_contact_date).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
                {record.next_follow_up_date && (
                  <div>
                    <span className="text-gray-600">Next Follow-up:</span>
                    <span className="ml-2 font-medium">
                      {new Date(record.next_follow_up_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Priority:</span>
                  <span className={`ml-2 font-medium ${record.priority === 'high' ? 'text-red-600' :
                    record.priority === 'low' ? 'text-gray-500' :
                      'text-blue-600'
                    }`}>
                    {record.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Activity Timeline</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              {timelineEntries.length > 0 ? (
                <div className="space-y-3">
                  {timelineEntries.map((entry, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1 text-sm text-gray-700">
                        {entry}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No activity recorded yet</p>
              )}
            </div>
          </div>

          {/* Add Follow-up Form */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Add Follow-up</h3>

            <div className="space-y-4">
              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="contacted">Contacted</option>
                  <option value="follow_up_sent">Follow-up Sent</option>
                  <option value="registered">Registered</option>
                  <option value="declined">Declined</option>
                  <option value="no_response">No Response</option>
                </select>
              </div>

              {/* Follow-up Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Note *
                </label>
                <textarea
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  placeholder="What happened in this follow-up? Any response or next steps?"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Next Follow-up Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Follow-up Date
                </label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmitFollowUp}
                  disabled={isSubmitting || !followUpNote.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Follow-up'}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon,
  subtitle
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle: string;
}) {
  return (
    <Card>
      <CardBody className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        {icon}
      </CardBody>
    </Card>
  );
}