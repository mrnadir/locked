import type { IconName, PermissionKind } from '@/constants/types';

export interface OnboardingSlide {
  key: string;
  icon: IconName;
  title: string;
  description: string;
}

export const OnboardingSlides: OnboardingSlide[] = [
  {
    key: 'focus',
    icon: 'hourglass',
    title: 'Take back your time',
    description:
      'Distracting apps steal hours every day. Locked helps you stay focused on what really matters.',
  },
  {
    key: 'block',
    icon: 'lock-closed',
    title: 'Block distracting apps',
    description:
      'Pick the apps you want to block, set a focus session or a schedule, and we will keep them locked.',
  },
  {
    key: 'track',
    icon: 'stats-chart',
    title: 'Understand your screen time',
    description:
      'See which apps take the most of your time, how often you open them, and track your progress.',
  },
];

export const PermissionInfo: Record<
  PermissionKind,
  { icon: IconName; title: string; description: string }
> = {
  usageAccess: {
    icon: 'stats-chart',
    title: 'Usage access',
    description: 'Needed to read screen time and detect when a blocked app is opened.',
  },
  overlay: {
    icon: 'phone-portrait',
    title: 'Display over other apps',
    description: 'Lets Locked show the block screen on top of a blocked app.',
  },
  accessibility: {
    icon: 'shield-checkmark',
    title: 'Accessibility service',
    description: 'Keeps blocking reliable, even when the app is in the background.',
  },
};

export const MotivationalQuotes = [
  'The secret of getting ahead is getting started.',
  'Focus on being productive instead of busy.',
  'You will never find time for anything. You must make it.',
  'Small steps every day lead to big results.',
  'Discipline is choosing what you want most over what you want now.',
  'Your future is created by what you do today, not tomorrow.',
  'Do the hard work, especially when you do not feel like it.',
];

export const WeekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
