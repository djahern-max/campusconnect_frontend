'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Plus, Copy, CheckCircle, Clock, XCircle, Mail, MessageSquare } from 'lucide-react';

interface InvitationCode {
  id: number;
  code: string;
  entity_type: string;
  entity_id: number;
  assigned_email?: string;
  status: 'pending' | 'claimed' | 'expired';
  expires_at: string;
  created_at: string;
  entity_name?: string;
}

interface Institution {
  id: number;
  name: string;
}

interface Scholarship {
  id: number;
  title: string;
}

const MESSAGE_TEMPLATES = {
  email_initial: {
    name: "Initial Outreach - Personal Story",
    subject: "Help a Family Find the Perfect College",
    body: `Hello {contact_name},

I hope this message finds you well. My name is Danny Ahern, and I'm reaching out personally about CampusConnect.

I built this application for my daughter who is currently looking at colleges and applying for scholarships. I'm just an ordinary family man who loves coding, and I wanted to create something that could help families like mine discover amazing institutions like {institution_name}.

I would greatly appreciate it if you could try out this application and provide feedback. As a token of appreciation, I'm offering you a 30-day free trial with this invitation code:

**Your Invitation Code:** {invitation_code}

**Register here:** https://campusconnect.com/register

**What you'll get:**
- Showcase your campus with unlimited images
- Add virtual tour videos
- Enhance your profile with detailed descriptions
- Only $39.99/month after trial (cancel anytime)

I truly hope you find this website useful for connecting with prospective students.

Thank you so much for your time and consideration!

Best regards,
Danny Ahern
Founder, CampusConnect`
  },
  email_short: {
    name: "Short & Sweet",
    subject: "Free 30-day trial for {institution_name}",
    body: `Hi {contact_name},

Quick message: I've reserved a 30-day free trial of CampusConnect for {institution_name}.

Code: {invitation_code}
Link: https://campusconnect.com/register

• Unlimited images
• Campus tour videos
• Enhanced profile
• $39.99/month after trial

Questions? Just reply!

Danny Ahern
CampusConnect`
  },
  linkedin: {
    name: "LinkedIn - Professional",
    subject: "",
    body: `Hi {contact_name},

I'm reaching out about CampusConnect - a platform I built to help students discover institutions like {institution_name}.

I'm offering {institution_name} a 30-day free trial to enhance your profile with:
• Unlimited campus photos
• Virtual tour videos  
• Detailed program descriptions

Invitation code: {invitation_code}
Register: https://campusconnect.com/register

Would love your feedback as we're constantly improving!

- Danny Ahern`
  }
};

export default function InvitationManagerPage() {
  const [invitations, setInvitations] = useState<InvitationCode[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Message generation state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<InvitationCode | null>(null);
  const [contactName, setContactName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof MESSAGE_TEMPLATES>('email_initial');
  const [generatedMessage, setGeneratedMessage] = useState('');

  // Form state
  const [entityType, setEntityType] = useState<'institution' | 'scholarship'>('institution');
  const [entityId, setEntityId] = useState('');
  const [assignedEmail, setAssignedEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('30');

  useEffect(() => {
    fetchInvitations();
    fetchInstitutions();
    fetchScholarships();
  }, []);

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/v1/admin/auth/invitations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();

        // Fetch entity names for each invitation using by-ID endpoints
        const invitationsWithNames = await Promise.all(
          data.map(async (inv: InvitationCode) => {
            const entityName = await fetchEntityNameById(inv.entity_type, inv.entity_id);
            return { ...inv, entity_name: entityName };
          })
        );

        setInvitations(invitationsWithNames);
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEntityNameById = async (type: string, id: number): Promise<string> => {
    try {
      if (type === 'institution') {
        const response = await fetch(`http://localhost:8000/api/v1/institutions/by-id/${id}`);
        if (response.ok) {
          const data = await response.json();
          return data.name;
        }
      } else {
        const response = await fetch(`http://localhost:8000/api/v1/scholarships/${id}`);
        if (response.ok) {
          const data = await response.json();
          return data.title;
        }
      }
    } catch (err) {
      console.error(`Error fetching ${type} name:`, err);
    }
    return `Unknown ${type}`;
  };

  const fetchInstitutions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/institutions?limit=100');
      if (response.ok) {
        const data = await response.json();
        setInstitutions(data);
      }
    } catch (err) {
      console.error('Error fetching institutions:', err);
    }
  };

  const fetchScholarships = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/scholarships?limit=100');
      if (response.ok) {
        const data = await response.json();
        setScholarships(data);
      }
    } catch (err) {
      console.error('Error fetching scholarships:', err);
    }
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/v1/admin/auth/invitations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: parseInt(entityId),
          assigned_email: assignedEmail || undefined,
          expires_in_days: parseInt(expiresInDays)
        })
      });

      if (response.ok) {
        const newInvitation = await response.json();
        const entityName = await fetchEntityNameById(newInvitation.entity_type, newInvitation.entity_id);
        setInvitations([{ ...newInvitation, entity_name: entityName }, ...invitations]);

        // Reset form
        setEntityId('');
        setAssignedEmail('');

        // Auto-copy code
        await copyToClipboard(newInvitation.code);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create invitation');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create invitation');
    } finally {
      setIsCreating(false);
    }
  };

  const generateMessage = (invitation: InvitationCode, template: keyof typeof MESSAGE_TEMPLATES, contactName: string) => {
    const templateData = MESSAGE_TEMPLATES[template];
    let message = templateData.body;

    // Replace tokens
    message = message.replace(/{contact_name}/g, contactName || 'there');
    message = message.replace(/{institution_name}/g, invitation.entity_name || 'your institution');
    message = message.replace(/{invitation_code}/g, invitation.code);

    return {
      subject: templateData.subject.replace(/{institution_name}/g, invitation.entity_name || 'your institution'),
      body: message
    };
  };

  const handleGenerateMessage = () => {
    if (!selectedInvitation || !contactName) return;

    const { subject, body } = generateMessage(selectedInvitation, selectedTemplate, contactName);
    setGeneratedMessage(selectedTemplate.startsWith('email') ? `Subject: ${subject}\n\n${body}` : body);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openMessageGenerator = (invitation: InvitationCode) => {
    setSelectedInvitation(invitation);
    setShowMessageModal(true);
    setContactName('');
    setGeneratedMessage('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'claimed':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'claimed':
        return <CheckCircle className="h-4 w-4" />;
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invitation Manager</h1>
        <p className="text-gray-600">Create invitation codes and generate personalized messages</p>
      </div>

      {/* Create Invitation Form */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Create New Invitation</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleCreateInvitation} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Entity Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as 'institution' | 'scholarship')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="institution">Institution</option>
                  <option value="scholarship">Scholarship</option>
                </select>
              </div>

              {/* Entity Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {entityType === 'institution' ? 'Institution' : 'Scholarship'}
                </label>
                <select
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select {entityType === 'institution' ? 'an institution' : 'a scholarship'}</option>
                  {entityType === 'institution'
                    ? institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))
                    : scholarships.map((sch) => (
                      <option key={sch.id} value={sch.id}>{sch.title}</option>
                    ))
                  }
                </select>
              </div>

              {/* Assigned Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Email (Optional)</label>
                <input
                  type="email"
                  placeholder="admin@university.edu"
                  value={assignedEmail}
                  onChange={(e) => setAssignedEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">Leave blank to allow any email</p>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expires In (Days)</label>
                <input
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Create Invitation Code
                </>
              )}
            </button>
          </form>
        </CardBody>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Invitation Codes</h2>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No invitation codes yet. Create one above!
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <code className="text-lg font-mono font-semibold text-gray-900">
                          {invitation.code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(invitation.code)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy code"
                        >
                          {copiedCode === invitation.code ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        <strong>{invitation.entity_name}</strong> ({invitation.entity_type})
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {invitation.assigned_email && (
                          <span>📧 {invitation.assigned_email}</span>
                        )}
                        <span>📅 Expires: {new Date(invitation.expires_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invitation.status)}`}>
                        {getStatusIcon(invitation.status)}
                        <span className="capitalize">{invitation.status}</span>
                      </span>

                      {invitation.status === 'pending' && (
                        <button
                          onClick={() => openMessageGenerator(invitation)}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                          title="Generate message"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Generate Message
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Message Generator Modal */}
      {showMessageModal && selectedInvitation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Generate Message</h2>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Institution Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-900">
                    <strong>{selectedInvitation.entity_name}</strong>
                    <div className="mt-1">Code: <code className="font-mono font-semibold">{selectedInvitation.code}</code></div>
                  </div>
                </div>

                {/* Contact Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. Smith"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Template
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(MESSAGE_TEMPLATES).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedTemplate(key as keyof typeof MESSAGE_TEMPLATES)}
                        className={`p-3 rounded-lg border-2 text-left transition-colors ${selectedTemplate === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        {key.startsWith('email') ? (
                          <Mail className="h-5 w-5 mb-2 text-blue-600" />
                        ) : (
                          <MessageSquare className="h-5 w-5 mb-2 text-blue-700" />
                        )}
                        <div className="font-medium text-sm">{template.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateMessage}
                  disabled={!contactName}
                  className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Message
                </button>

                {/* Generated Message */}
                {generatedMessage && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Generated Message
                      </label>
                      <button
                        onClick={() => copyToClipboard(generatedMessage)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {copiedCode === generatedMessage ? '✓ Copied!' : 'Copy to Clipboard'}
                      </button>
                    </div>
                    <textarea
                      value={generatedMessage}
                      readOnly
                      rows={15}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}