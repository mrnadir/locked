import { Alert } from 'react-native';

import type { Schedule } from '@/constants/types';
import { useBlocker } from '@/context/blocker-context';
import { useSettings } from '@/context/settings-context';
import { isScheduleLocked } from '@/utils/block-status';

export function useScheduleToggle() {
  const { settings } = useSettings();
  const { toggleSchedule } = useBlocker();

  return (schedule: Schedule) => {
    if (!isScheduleLocked(schedule, settings.strictMode, new Date())) {
      toggleSchedule(schedule.id);
      return;
    }
    Alert.alert('Block is locked', 'Strict mode is on and this block is running. It cannot be turned off until it finishes.');
  };
}
