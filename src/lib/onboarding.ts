export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
}

/** Static onboarding checklist. Completion state persists in localStorage.
 *  This will be replaced by a Dataverse table in a later iteration. */
export const ONBOARDING_TASKS: OnboardingTask[] = [
  { id: 'accounts', title: 'Activate your accounts', description: 'Sign in to Microsoft 365, set up MFA, and confirm your work email.' },
  { id: 'profile', title: 'Complete your HR profile', description: 'Fill in your personal details and emergency contact in the HR system.' },
  { id: 'equipment', title: 'Collect your equipment', description: 'Pick up your laptop, headset, and access badge from IT.' },
  { id: 'policies', title: 'Read key policies', description: 'Review the absence, remote-work, and code-of-conduct policies.' },
  { id: 'manager', title: 'Meet your manager', description: 'Schedule a welcome 1:1 with your manager to align on goals.' },
  { id: 'team', title: 'Meet your team', description: 'Introduce yourself in the team channel and book intro chats.' },
  { id: 'training', title: 'Complete mandatory training', description: 'Finish the security and compliance onboarding modules.' },
  { id: 'holidays', title: 'Review your holiday allowance', description: 'Check your allowance on the Holidays page and plan ahead.' },
];

export const ONBOARDING_STORAGE_KEY = 'promx-hr-onboarding';

export function loadOnboardingState(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function saveOnboardingState(state: Record<string, boolean>): void {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore storage errors */
  }
}

export function onboardingProgress(state: Record<string, boolean>): {
  completed: number;
  total: number;
  percent: number;
} {
  const total = ONBOARDING_TASKS.length;
  const completed = ONBOARDING_TASKS.filter((t) => state[t.id]).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
}
