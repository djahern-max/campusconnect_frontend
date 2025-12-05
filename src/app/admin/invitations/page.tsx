//src/app/admin/invitations/page.tsx
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import {
  Plus,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { API_URL } from '@/config/api';

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
    name: "Initial Outreach – Free 1-Year Trial",
    subject: "Free 1-Year Profile for {institution_name}",
    body: `Hi {contact_name},

I'd love to offer {institution_name} a **completely free 1-year profile** on **The College Directory**, a new platform I'm building to help students discover colleges in a more personal and meaningful way.

Your invitation code: **{invitation_code}**  
Activate here: https://thecollegedirectory.com/register

The platform currently uses **IPEDS data as a starting point**, but as you know, federal datasets are often outdated by a year or more. This means students may not be seeing the most accurate reflection of your institution.

By joining, you can:
• Update key data so students see the **most current and accurate information**  
• Add unlimited photos to showcase your campus  
• Upload videos, virtual tours, or student interviews  
• Highlight programs, admissions updates, and unique qualities  

This gives you the opportunity to present a modern, engaging, and **up-to-date profile** rather than relying only on old IPEDS snapshots.

The core platform will remain free for the first year as we gather feedback from early partners like you.

My long-term plan is to offer optional services such as:
• Custom-designed profile pages  
• Professional virtual campus tour videos  
• Student spotlight interviews  

These optional services help fund development while keeping the directory accessible.

I’d love to have {institution_name} involved as an early test partner and help shape the future of the platform.

Best regards,  
Dane Ahern  
Founder, The College Directory`,
  },

  email_short: {
    name: "Short & Direct",
    subject: "Invitation for {institution_name} – Free 1-Year Profile",
    body: `Hi {contact_name},

I'd like to offer {institution_name} a **free 1-year profile** on **The College Directory**.

Your code: **{invitation_code}**  
Activate: https://thecollegedirectory.com/register

We start with IPEDS as a foundation, but much of that data is out-of-date. Your profile lets you:
• Update your most current information  
• Add engaging photos and videos  
• Showcase programs and campus highlights  

Optional services like virtual tour videos and custom profile pages are also available.

Would love to have you join as an early partner!

Best,  
Dane`,
  },

  linkedin: {
    name: "LinkedIn – Professional",
    subject: "",
    body: `Hi {contact_name},

I'm the founder of **The College Directory**, a platform built to help students explore institutions more meaningfully.

I'd like to offer {institution_name} a **free 1-year profile** with no commitments.

Invitation code: {invitation_code}  
Register: https://thecollegedirectory.com/register

We use **IPEDS as a baseline**, but since those datasets can be outdated, this gives you the opportunity to ensure students see **current, accurate information**, along with engaging photos, videos, and campus highlights.

Optional services like virtual campus tour videos, custom page design, and student interviews are available if you'd like additional support.

Would love to have you as an early test partner!

– Dane`,
  },
};



export default function InvitationManagerPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore(); // assumes store supports this

  const [invitations, setInvitations] = useState<InvitationCode[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Message generation state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] =
    useState<InvitationCode | null>(null);
  const [contactName, setContactName] = useState('');
  const [selectedTemplate, setSelectedTemplate] =
    useState<keyof typeof MESSAGE_TEMPLATES>('email_initial');
  const [generatedMessage, setGeneratedMessage] = useState('');

  // Form state
  const [entityType, setEntityType] =
    useState<'institution' | 'scholarship'>('institution');
  const [entityId, setEntityId] = useState('');
  const [assignedEmail, setAssignedEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('30');
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchInvitations();
      fetchScholarships();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (selectedInvitation && contactName && contactName.length > 1) {
      const { subject, body } = generateMessage(
        selectedInvitation,
        selectedTemplate,
        contactName
      );
      setGeneratedMessage(
        selectedTemplate.startsWith('email')
          ? `Subject: ${subject}\n\n${body}`
          : body
      );
    } else {
      setGeneratedMessage('');
    }
  }, [contactName, selectedTemplate, selectedInvitation]);

  const filteredInstitutions =
    entityType === 'institution'
      ? institutions.filter((inst) =>
        inst.name.toLowerCase().includes(institutionSearch.toLowerCase())
      )
      : institutions;

  const fetchEntityNameById = async (
    type: string,
    id: number
  ): Promise<string> => {
    try {
      if (type === 'institution') {
        const response = await fetch(
          `${API_URL}/api/v1/institutions/by-id/${id}`
        );
        if (response.ok) {
          const data = await response.json();
          return data.name;
        }
      } else {
        const response = await fetch(
          `${API_URL}/api/v1/scholarships/${id}`
        );
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

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_URL}/api/v1/admin/auth/invitations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }

      const data: InvitationCode[] = await response.json();

      // Fetch entity names for each invitation
      const invitationsWithNames = await Promise.all(
        data.map(async (inv) => ({
          ...inv,
          entity_name: await fetchEntityNameById(
            inv.entity_type,
            inv.entity_id
          ),
        }))
      );

      setInvitations(invitationsWithNames);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const searchInstitutions = async (query: string) => {
    if (!query || query.length < 2) {
      setInstitutions([]);
      setShowInstitutionDropdown(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/v1/institutions/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        console.error("Search failed");
        return;
      }

      const data = await response.json();

      setInstitutions(
        data.map((inst: any) => ({
          id: inst.id,
          name: inst.name
        }))
      );
      setShowInstitutionDropdown(data.length > 0);
    } catch (err) {
      console.error("Error searching institutions:", err);
    }
  };




  const fetchScholarships = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/scholarships?limit=100`
      );
      if (response.ok) {
        const data = await response.json();

        // ✅ Handle paginated response (check if scholarships endpoint also uses pagination)
        if (data.scholarships && Array.isArray(data.scholarships)) {
          setScholarships(data.scholarships);
        } else if (Array.isArray(data)) {
          setScholarships(data);  // Scholarships might still return array directly
        } else {
          console.error('Unexpected scholarships response:', data);
          setScholarships([]);
        }
      }
    } catch (err) {
      console.error('Error fetching scholarships:', err);
      setScholarships([]);
    }
  };

  const handleCreateInvitation = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/v1/admin/auth/invitations`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entity_type: entityType,
            entity_id: parseInt(entityId, 10),
            assigned_email: assignedEmail || undefined,
            expires_in_days: parseInt(expiresInDays, 10),
          }),
        }
      );

      if (response.ok) {
        const newInvitation: InvitationCode = await response.json();
        const entityName = await fetchEntityNameById(
          newInvitation.entity_type,
          newInvitation.entity_id
        );
        setInvitations([
          { ...newInvitation, entity_name: entityName },
          ...invitations,
        ]);

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

  const generateMessage = (
    invitation: InvitationCode,
    template: keyof typeof MESSAGE_TEMPLATES,
    contactNameValue: string
  ) => {
    const templateData = MESSAGE_TEMPLATES[template];
    let message = templateData.body;

    message = message.replace(
      /{contact_name}/g,
      contactNameValue || 'there'
    );
    message = message.replace(
      /{institution_name}/g,
      invitation.entity_name || 'your institution'
    );
    message = message.replace(
      /{invitation_code}/g,
      invitation.code
    );

    return {
      subject: templateData.subject.replace(
        /{institution_name}/g,
        invitation.entity_name || 'your institution'
      ),
      body: message,
    };
  };

  const handleGenerateMessage = async () => {
    if (!selectedInvitation || !contactName) return;

    const { subject, body } = generateMessage(
      selectedInvitation,
      selectedTemplate,
      contactName
    );
    setGeneratedMessage(
      selectedTemplate.startsWith('email')
        ? `Subject: ${subject}\n\n${body}`
        : body
    );

    const contactMethod =
      selectedTemplate === 'linkedin' ? 'linkedin' : 'email';

    try {
      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/v1/admin/outreach`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entity_type: selectedInvitation.entity_type,
            entity_id: selectedInvitation.entity_id,
            contact_name: contactName,
            contact_email: selectedInvitation.assigned_email || '',
            notes: `Generated ${selectedTemplate} message. Invitation code: ${selectedInvitation.code}`,
            contact_method: contactMethod,
          }),
        }
      );

      if (response.ok) {
        console.log('✅ Outreach tracked');
      } else {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        alert(`Error: ${JSON.stringify(errorData)}`);
      }
    } catch (err) {
      console.error('Error tracking outreach:', err);
    }
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

  const createOutreachRecord = async (invitation: InvitationCode) => {
    try {
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/v1/admin/outreach`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entity_type: invitation.entity_type,
            entity_id: invitation.entity_id,
            contact_email: invitation.assigned_email,
            notes: `Invitation code: ${invitation.code}`,
          }),
        }
      );

      if (response.ok) {
        alert('✅ Outreach record created! Check the Outreach page.');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create outreach record');
      }
    } catch (err: any) {
      console.error('Failed to create outreach record:', err);
      setError('Failed to create outreach record');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Invitation Manager
        </h1>
        <p className="text-gray-600">
          Create invitation codes and generate personalized messages
        </p>
      </div>

      {/* Create Invitation Form */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Create New Invitation</h2>
        </CardHeader>
        <CardBody>
          <form
            onSubmit={handleCreateInvitation}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Entity Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entity Type
                </label>
                <select
                  value={entityType}
                  onChange={(e) =>
                    setEntityType(
                      e.target.value as 'institution' | 'scholarship'
                    )
                  }
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

                {entityType === 'institution' ? (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Start typing institution name (e.g., Harvard, Stanford)..."
                      value={institutionSearch}
                      onChange={(e) => {
                        setInstitutionSearch(e.target.value);
                        searchInstitutions(e.target.value);
                      }}
                      onFocus={() => {
                        if (institutions.length > 0) {
                          setShowInstitutionDropdown(true);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Dropdown Results */}
                    {showInstitutionDropdown && institutions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {institutions.map((inst) => (
                          <button
                            key={inst.id}
                            type="button"
                            onClick={() => {
                              setEntityId(inst.id.toString());
                              setInstitutionSearch(inst.name);
                              setShowInstitutionDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${entityId === inst.id.toString() ? 'bg-blue-100 font-medium' : ''
                              }`}
                          >
                            {inst.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Show message when typing but no results */}
                    {institutionSearch.length >= 2 && institutions.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm text-gray-500">
                        No institutions found matching "{institutionSearch}"
                      </div>
                    )}

                    {/* Selected institution indicator */}
                    {entityId && institutionSearch && (
                      <div className="mt-2 text-sm text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Selected: {institutionSearch}
                      </div>
                    )}
                  </div>
                ) : (
                  <select
                    value={entityId}
                    onChange={(e) => setEntityId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a scholarship</option>
                    {scholarships.map((sch) => (
                      <option key={sch.id} value={sch.id}>
                        {sch.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Assigned Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="admin@university.edu"
                  value={assignedEmail}
                  onChange={(e) => setAssignedEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Leave blank to allow any email
                </p>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires In (Days)
                </label>
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
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                'Creating...'
              ) : (
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
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
                        <strong>{invitation.entity_name}</strong> (
                        {invitation.entity_type})
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {invitation.assigned_email && (
                          <span>📧 {invitation.assigned_email}</span>
                        )}
                        <span>
                          📅 Expires:{' '}
                          {new Date(
                            invitation.expires_at
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          invitation.status
                        )}`}
                      >
                        {getStatusIcon(invitation.status)}
                        <span className="capitalize">
                          {invitation.status}
                        </span>
                      </span>

                      {invitation.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              openMessageGenerator(invitation)
                            }
                            className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                            title="Generate message"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Generate Message
                          </button>
                        </>
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
                <h2 className="text-2xl font-bold text-gray-900">
                  Generate Message
                </h2>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-900">
                    <strong>{selectedInvitation.entity_name}</strong>
                    <div className="mt-1">
                      Code:{' '}
                      <code className="font-mono font-semibold">
                        {selectedInvitation.code}
                      </code>
                    </div>
                  </div>
                </div>

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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Template
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(MESSAGE_TEMPLATES).map(
                      ([key, template]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setSelectedTemplate(
                              key as keyof typeof MESSAGE_TEMPLATES
                            )
                          }
                          className={`p-3 rounded-lg border-2 text-left transition-colors ${selectedTemplate === key
                            ? 'border-gray-600 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          {key.startsWith('email') ? (
                            <Mail className="h-5 w-5 mb-2 text-gray-700" />
                          ) : (
                            <MessageSquare className="h-5 w-5 mb-2 text-gray-700" />
                          )}
                          <div className="font-medium text-sm">
                            {template.name}
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {generatedMessage && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Generated Message
                      </label>
                    </div>
                    <textarea
                      value={generatedMessage}
                      readOnly
                      rows={15}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                    />

                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedMessage)}
                        className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                      >
                        {copiedCode === generatedMessage ? (
                          <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-5 w-5 mr-2" />
                            Copy to Clipboard
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          await handleGenerateMessage();
                          await copyToClipboard(generatedMessage);
                          setTimeout(() => {
                            setShowMessageModal(false);
                            setGeneratedMessage('');
                            setContactName('');
                          }, 800);
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Copy className="h-5 w-5 mr-2" />
                        Copy &amp; Close
                      </button>
                    </div>
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
