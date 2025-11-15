'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Copy, Check, Mail, Clock } from 'lucide-react';
import apiClient from '@/api/client';

interface InvitationCode {
  id: number;
  code: string;
  entity_type: string;
  entity_id: number;
  assigned_email?: string;
  status: string;
  expires_at?: string;
  claimed_at?: string;
  created_at: string;
}

export default function InvitationManagementPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [invitations, setInvitations] = useState<InvitationCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Form state
  const [entityType, setEntityType] = useState<'institution' | 'scholarship'>('institution');
  const [entityId, setEntityId] = useState('');
  const [assignedEmail, setAssignedEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    fetchInvitations();
  }, [isAuthenticated, router]);

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await apiClient.get<InvitationCode[]>(
        '/admin/auth/invitations',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInvitations(response.data);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await apiClient.post<InvitationCode>(
        '/admin/auth/invitations',
        {
          entity_type: entityType,
          entity_id: parseInt(entityId),
          assigned_email: assignedEmail || undefined,
          expires_in_days: expiresInDays
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add to list
      setInvitations([response.data, ...invitations]);

      // Reset form
      setEntityId('');
      setAssignedEmail('');
      
      // Auto-copy the new code
      await copyToClipboard(response.data.code);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create invitation');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      claimed: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Invitation Code Management
          </h1>
          <p className="text-gray-600">
            Generate invitation codes for institutions and scholarships
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">Generate Invitation</h2>
              </CardHeader>
              <CardBody>
                <form onSubmit={createInvitation} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entity Type
                    </label>
                    <select
                      value={entityType}
                      onChange={(e) => setEntityType(e.target.value as 'institution' | 'scholarship')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="institution">Institution</option>
                      <option value="scholarship">Scholarship</option>
                    </select>
                  </div>

                  <Input
                    type="number"
                    label={`${entityType === 'institution' ? 'Institution' : 'Scholarship'} ID`}
                    placeholder="Enter entity ID"
                    value={entityId}
                    onChange={(e) => setEntityId(e.target.value)}
                    required
                  />

                  <Input
                    type="email"
                    label="Assigned Email (Optional)"
                    placeholder="admin@university.edu"
                    value={assignedEmail}
                    onChange={(e) => setAssignedEmail(e.target.value)}
                  />

                  <Input
                    type="number"
                    label="Expires In (Days)"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                    min={1}
                    max={365}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isCreating}
                  >
                    Generate Code
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>

          {/* Invitation List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">
                  All Invitations ({invitations.length})
                </h2>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : invitations.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No invitations created yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <code className="text-lg font-mono font-bold text-primary-600">
                                {inv.code}
                              </code>
                              <button
                                onClick={() => copyToClipboard(inv.code)}
                                className="text-gray-400 hover:text-primary-600 transition"
                              >
                                {copiedCode === inv.code ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                <strong>Entity:</strong> {inv.entity_type} #{inv.entity_id}
                              </p>
                              {inv.assigned_email && (
                                <p className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {inv.assigned_email}
                                </p>
                              )}
                              {inv.expires_at && (
                                <p className="flex items-center text-orange-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Expires: {new Date(inv.expires_at).toLocaleDateString()}
                                </p>
                              )}
                              {inv.claimed_at && (
                                <p className="text-green-600">
                                  Claimed: {new Date(inv.claimed_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>

                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(inv.status)}`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
