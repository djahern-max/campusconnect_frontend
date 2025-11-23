// src/components/GalleryDiagnostics.tsx
'use client';

import { useState } from 'react';
import { API_URL } from '@/config/api';

export default function GalleryDiagnostics() {
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const testConnection = async () => {
        setLoading(true);
        setResult('Testing...');

        try {
            // Test 1: Check if backend is running
            const response = await fetch(`${API_URL}/api/v1/admin/gallery`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add your auth token here if you have one
                    // 'Authorization': 'Bearer YOUR_TOKEN'
                },
                credentials: 'include',
            });

            const data = await response.json();

            setResult(`
✅ Connection Successful!
Status: ${response.status}
Data: ${JSON.stringify(data, null, 2)}
            `);
        } catch (error: any) {
            setResult(`
❌ Connection Failed!
Error: ${error.message}

Common issues:
1. Is your backend running? (Check browser console for API_URL: ${API_URL})
2. Check CORS settings in backend
3. Check if you're authenticated
4. Verify the API endpoint exists in your backend

To fix:
- Start backend: cd campusconnect-backend && source venv/bin/activate && uvicorn app.main:app --reload
- Check backend logs for errors
            `);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2>🔍 Gallery API Diagnostic Tool</h2>

            <button
                onClick={testConnection}
                disabled={loading}
                style={{
                    padding: '1rem 2rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                }}
            >
                {loading ? 'Testing...' : 'Test API Connection'}
            </button>

            {result && (
                <pre
                    style={{
                        background: '#f3f4f6',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.875rem',
                        border: '1px solid #d1d5db',
                    }}
                >
                    {result}
                </pre>
            )}

            <div style={{ marginTop: '2rem', background: '#eff6ff', padding: '1.5rem', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>📋 Checklist:</h3>
                <ul style={{ lineHeight: '2' }}>
                    <li>✓ Backend tests passing (you confirmed this ✅)</li>
                    <li>❓ Backend server running on port 8000?</li>
                    <li>❓ Frontend can reach backend?</li>
                    <li>❓ API client configured correctly?</li>
                    <li>❓ Authentication token present?</li>
                </ul>
            </div>
        </div>
    );
}