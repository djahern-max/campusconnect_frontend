'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, MessageSquare, Phone, Copy, Check, Edit, Trash2, Plus } from 'lucide-react';
import apiClient from '@/api/client';

interface MessageTemplate {
  id: number;
  name: string;
  template_type: string;
  subject?: string;
  body: string;
  times_used: number;
  conversion_count: number;
  is_active: boolean;
  is_default: boolean;
}

// Default templates that will be created
const DEFAULT_TEMPLATES = [
  {
    name: "Initial Outreach - Personal Story",
    template_type: "email",
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
Founder, CampusConnect`,
    is_default: true
  },
  {
    name: "Follow-up - Gentle Reminder",
    template_type: "email",
    subject: "Following up on CampusConnect invitation",
    body: `Hi {contact_name},

I wanted to follow up on my previous message about CampusConnect.

I understand you're busy, but I wanted to make sure you received your invitation code to try our platform free for 30 days.

Your code: {invitation_code}
Register: https://campusconnect.com/register

If you have any questions or feedback, I'd love to hear from you. You can reply directly to this email.

Thanks again!

Danny Ahern
CampusConnect`,
  },
  {
    name: "LinkedIn - Professional Approach",
    template_type: "linkedin",
    body: `Hi {contact_name},

I'm reaching out about CampusConnect - a platform I built to help students discover institutions like {institution_name}.

I'm offering {institution_name} a 30-day free trial to enhance your profile with:
• Unlimited campus photos
• Virtual tour videos  
• Detailed program descriptions

Invitation code: {invitation_code}
Register: https://campusconnect.com/register

Would love your feedback as we're constantly improving!

- Danny Ahern`,
  },
  {
    name: "Short & Sweet",
    template_type: "email",
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

Danny`,
  }
];

export default function MessageTemplatesPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    template_type: 'email',
    subject: '',
    body: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    fetchTemplates();
  }, [isAuthenticated, router]);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await apiClient.get<MessageTemplate[]>(
        '/admin/outreach/templates',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTemplates(response.data);
      
      // If no templates exist, create defaults
      if (response.data.length === 0) {
        await createDefaultTemplates();
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultTemplates = async () => {
    const token = localStorage.getItem('access_token');
    
    for (const template of DEFAULT_TEMPLATES) {
      try {
        await apiClient.post(
          '/admin/outreach/templates',
          template,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Failed to create default template:', error);
      }
    }
    
    fetchTemplates();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    try {
      if (editingTemplate) {
        // Update existing
        await apiClient.put(
          `/admin/outreach/templates/${editingTemplate.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new
        await apiClient.post(
          '/admin/outreach/templates',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      setIsCreating(false);
      setEditingTemplate(null);
      setFormData({ name: '', template_type: 'email', subject: '', body: '' });
      fetchTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const copyTemplate = async (body: string, id: number) => {
    await navigator.clipboard.writeText(body);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    const token = localStorage.getItem('access_token');
    try {
      await apiClient.delete(
        `/admin/outreach/templates/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5 text-blue-600" />;
      case 'linkedin':
        return <MessageSquare className="h-5 w-5 text-blue-700" />;
      case 'text':
        return <Phone className="h-5 w-5 text-green-600" />;
      default:
        return <Mail className="h-5 w-5 text-gray-600" />;
    }
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Message Templates
              </h1>
              <p className="text-gray-600">
                Create and manage outreach message templates
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setIsCreating(true);
                setEditingTemplate(null);
                setFormData({ name: '', template_type: 'email', subject: '', body: '' });
              }}
            >
              <Plus className="h-5 w-5 mr-2" />
              New Template
            </Button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingTemplate) && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-bold">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Template Name"
                  placeholder="e.g., Initial Outreach - Personal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.template_type}
                    onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="email">Email</option>
                    <option value="linkedin">LinkedIn Message</option>
                    <option value="text">Text Message</option>
                  </select>
                </div>

                {formData.template_type === 'email' && (
                  <Input
                    label="Subject"
                    placeholder="Subject line..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Body
                  </label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Your message here..."
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Available tokens: {'{contact_name}'}, {'{institution_name}'}, {'{invitation_code}'}, {'{city}'}, {'{state}'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" variant="primary">
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingTemplate(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Templates List */}
        <div className="grid md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(template.template_type)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      {template.is_default && (
                        <span className="text-xs text-green-600 font-medium">Default</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyTemplate(template.body, template.id)}
                      className="text-gray-400 hover:text-primary-600"
                      title="Copy to clipboard"
                    >
                      {copiedId === template.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingTemplate(template);
                        setFormData({
                          name: template.name,
                          template_type: template.template_type,
                          subject: template.subject || '',
                          body: template.body
                        });
                        setIsCreating(false);
                      }}
                      className="text-gray-400 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {!template.is_default && (
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {template.subject && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Subject:</p>
                    <p className="text-sm font-medium text-gray-900">{template.subject}</p>
                  </div>
                )}
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {template.body.length > 300 
                      ? template.body.substring(0, 300) + '...' 
                      : template.body
                    }
                  </pre>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Used {template.times_used} times</span>
                  <span>{template.conversion_count} conversions</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {templates.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No templates yet</p>
            <Button variant="primary" onClick={() => setIsCreating(true)}>
              Create Your First Template
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
