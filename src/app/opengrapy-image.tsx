// src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Abacadaba - The College & Scholarship Directory';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '64px 96px',
                    backgroundColor: '#ffffff',
                    color: '#111827',
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
            >
                {/* Top: brand with sparkle */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        fontSize: 28,
                    }}
                >
                    {/* Sparkle logo */}
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 9999,
                            border: '2px solid #3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                        }}
                    >
                        <span style={{ fontSize: 26 }}>✨</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#111827' }}>Abacadaba</span>
                </div>

                {/* Middle: main message */}
                <div>
                    <div
                        style={{
                            fontSize: 64,
                            fontWeight: 700,
                            lineHeight: 1.1,
                            maxWidth: 900,
                            marginBottom: 24,
                        }}
                    >
                        The College &amp; Scholarship Directory
                    </div>

                    {/* A/B/C/D visual */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: 12,
                        }}
                    >
                        <span style={{ fontSize: 80, fontWeight: 800, color: '#111827' }}>A</span>
                        <span style={{ fontSize: 48, fontWeight: 700, color: '#6b7280' }}>B</span>
                        <span style={{ fontSize: 40, fontWeight: 600, color: '#9ca3af', opacity: 0.8 }}>C</span>
                        <span style={{ fontSize: 32, fontWeight: 600, color: '#9ca3af', opacity: 0.6 }}>D</span>
                        <span style={{ fontSize: 32, color: '#111827', marginLeft: 8 }}>— No more guessing.</span>
                    </div>
                </div>

                {/* Bottom: value prop */}
                <div
                    style={{
                        fontSize: 26,
                        color: '#4b5563',
                        maxWidth: 800,
                        lineHeight: 1.4,
                    }}
                >
                    Where institutions create rich, accurate pages that students discover through MagicScholar.
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}