// src/middleware/trialGuard.ts
import { useAuthStore } from '@/stores/authStore';
import { calculateTrialStatus } from '@/utils/trialCalculations';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useTrialGuard(redirectTo: string = '/admin/subscription') {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user?.created_at) {
            const trialStatus = calculateTrialStatus(user.created_at);

            if (trialStatus.hasExpired) {
                // Optionally redirect to subscription page
                // router.push(redirectTo);

                // Or show a warning banner
                console.warn('Trial has expired');
            }
        }
    }, [user, router, redirectTo]);
}

// Usage in protected pages:
// useTrialGuard();