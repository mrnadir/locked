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

export interface LegalSection {
  title: string;
  body: string;
  bullets?: string[];
}

export interface LegalDocumentContent {
  icon: IconName;
  title: string;
  lastUpdated: string;
  summary: string;
  sections: LegalSection[];
}

export const PrivacyPolicy: LegalDocumentContent = {
  icon: 'shield-checkmark',
  title: 'Privacy Policy',
  lastUpdated: 'September 29, 2026',
  summary:
    'Locked is built to work offline. Your block list, schedules, screen time and settings stay on your device. We do not sell or share your personal data.',
  sections: [
    {
      title: 'Information we collect',
      body: 'Locked does not require an account. The app only stores what it needs to work, and it stores it locally on your device:',
      bullets: [
        'The apps you choose to block and your schedules',
        'Your focus session history',
        'Screen time and app usage statistics read from your device',
        'Your preferences, such as theme, name and block screen style',
      ],
    },
    {
      title: 'Device permissions',
      body: 'Locked asks for a few system permissions so it can detect and block distracting apps:',
      bullets: [
        'Usage access: to read screen time and detect when a blocked app opens',
        'Display over other apps: to show the block screen on top of a blocked app',
        'Accessibility service: to keep blocking reliable in the background',
      ],
    },
    {
      title: 'How we use your information',
      body: 'Your data is used only to block apps, run schedules and focus sessions, show your screen time insights and send the reminders you turn on. It never leaves your device unless you contact us yourself.',
    },
    {
      title: 'Sharing',
      body: 'We do not sell, rent or share your personal information with third parties. We do not use advertising or tracking SDKs.',
    },
    {
      title: 'Data retention and deletion',
      body: 'Your data stays on your device until you remove it. You can erase everything at any time by clearing the app data from your device settings or by uninstalling the app.',
    },
    {
      title: 'Children',
      body: 'Locked is not directed at children under 13, and we do not knowingly collect information from them.',
    },
    {
      title: 'Changes to this policy',
      body: 'We may update this policy from time to time. When we do, we will change the "Last updated" date at the top of this page.',
    },
  ],
};

export const TermsOfService: LegalDocumentContent = {
  icon: 'document-text',
  title: 'Terms of Service',
  lastUpdated: 'September 29, 2026',
  summary:
    'By using Locked you agree to these terms. Please read them carefully. If you do not agree, please do not use the app.',
  sections: [
    {
      title: 'Using Locked',
      body: 'Locked is a personal productivity tool that helps you limit access to distracting apps. You may use it for your own personal, non-commercial purposes.',
    },
    {
      title: 'Your responsibilities',
      body: 'You are responsible for how you configure the app, including the apps you block, your schedules and strict mode.',
      bullets: [
        'Do not block apps you may need in an emergency, such as Phone or Messages',
        'Do not use Locked to monitor or restrict another person without their consent',
      ],
    },
    {
      title: 'Strict mode',
      body: 'When strict mode is on, you cannot end focus sessions early or edit active schedules until they finish. Turn it on only if you are sure.',
    },
    {
      title: 'Availability',
      body: 'Blocking depends on system permissions and operating system behavior. We try our best, but we cannot guarantee that every app will be blocked in every situation.',
    },
    {
      title: 'Intellectual property',
      body: 'The Locked name, logo, design and code belong to Sparktech. You may not copy, modify or redistribute the app without permission.',
    },
    {
      title: 'Disclaimer',
      body: 'Locked is provided "as is" without warranties of any kind. To the maximum extent allowed by law, we are not liable for any loss resulting from the use of the app.',
    },
    {
      title: 'Changes to these terms',
      body: 'We may update these terms from time to time. Continuing to use Locked after an update means you accept the new terms.',
    },
  ],
};

export const AboutUs = {
  mission:
    'We believe your time is your most valuable resource. Locked exists to help you spend less time on distracting apps and more time on the people, work and habits that matter to you.',
  story:
    'Locked started as a small tool we built for ourselves when endless scrolling kept getting in the way of deep work. Today it helps people around the world build healthier digital habits, one focus session at a time.',
  features: [
    { icon: 'lock-closed', title: 'Block distracting apps', description: 'Choose the apps that pull you away and lock them.' },
    { icon: 'timer', title: 'Focus sessions', description: 'Start a timed session and stay in the zone.' },
    { icon: 'calendar', title: 'Smart schedules', description: 'Block apps automatically during work or sleep hours.' },
    { icon: 'stats-chart', title: 'Screen time insights', description: 'See where your time goes and track your progress.' },
  ] satisfies { icon: IconName; title: string; description: string }[],
  values: [
    { icon: 'shield-checkmark', title: 'Privacy first', description: 'Your data stays on your device. No accounts, no ads, no tracking.' },
    { icon: 'leaf', title: 'Calm by design', description: 'A simple, distraction-free app that respects your attention.' },
    { icon: 'heart', title: 'Built with care', description: 'We listen to feedback and keep improving Locked for you.' },
  ] satisfies { icon: IconName; title: string; description: string }[],
  company: 'Sparktech',
  companyDescription:
    'Locked is designed and developed by Sparktech, a product team focused on building simple, useful mobile apps that make everyday life better.',
};

export interface FaqItem {
  question: string;
  answer: string;
}

export const SupportFaqs: FaqItem[] = [
  {
    question: 'Why is a blocked app still opening?',
    answer:
      'Make sure all permissions are granted in Settings > Permissions. Some phones also stop background apps to save battery, so exclude Locked from battery optimization.',
  },
  {
    question: 'How do I turn off strict mode?',
    answer: 'Open Settings and switch off Strict mode under Blocking.',
  },
  {
    question: 'Does Locked collect my data?',
    answer: 'No. Everything stays on your device. See the Privacy Policy for details.',
  },
];
