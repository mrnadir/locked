import { useEffect } from 'react';

import { useSettings } from '@/context/settings-context';
import { navigationRef } from '@/navigation/navigation-ref';
import { getAppBlocker } from '@/utils/app-blocker';

/** Shows the block screen whenever the native layer reports a blocked app launch. */
export function useBlockedAppListener() {
  const { onboardingDone } = useSettings();

  useEffect(() => {
    if (!onboardingDone) return;
    return getAppBlocker().addBlockedAppOpenedListener((appId) => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('BlockOverlay', { appId });
      }
    });
  }, [onboardingDone]);
}
