// src/utils/trialCalculations.ts
export interface TrialStatus {
    isInTrial: boolean;
    daysRemaining: number;
    trialEndDate: Date;
    hasExpired: boolean;
    warningLevel: 'none' | 'normal' | 'warning' | 'urgent';
}

export function calculateTrialStatus(createdAt: string): TrialStatus {
    const TRIAL_DAYS = 30;

    const createdDate = new Date(createdAt);
    const now = new Date();

    // Calculate trial end date (30 days from created_at)
    const trialEndDate = new Date(createdDate);
    trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);

    // Calculate days remaining
    const timeRemaining = trialEndDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

    // Determine if expired
    const hasExpired = daysRemaining <= 0;

    // Determine warning level
    let warningLevel: 'none' | 'normal' | 'warning' | 'urgent' = 'none';
    if (daysRemaining <= 1) {
        warningLevel = 'urgent';
    } else if (daysRemaining <= 3) {
        warningLevel = 'warning';
    } else if (daysRemaining <= 7) {
        warningLevel = 'normal';
    }

    return {
        isInTrial: !hasExpired,
        daysRemaining: Math.max(0, daysRemaining),
        trialEndDate,
        hasExpired,
        warningLevel
    };
}

export function formatTrialMessage(trialStatus: TrialStatus): string {
    if (trialStatus.hasExpired) {
        return 'Trial Expired';
    }

    const days = trialStatus.daysRemaining;
    if (days === 0) {
        return 'Trial ends today!';
    } else if (days === 1) {
        return 'Trial: 1 day remaining';
    } else {
        return `Trial: ${days} days remaining`;
    }
}