import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

import type { Schedule } from '@/constants/types';
import { useBlocker } from '@/context/blocker-context';
import { useSettings } from '@/context/settings-context';
import { isScheduleLocked } from '@/utils/block-status';

export function useScheduleToggle() {
  const navigation = useNavigation();
  const { settings } = useSettings();
  const { toggleSchedule } = useBlocker();

  return (schedule: Schedule) => {
    if (!isScheduleLocked(schedule, settings.strictMode, new Date())) {
      toggleSchedule(schedule.id);
      return;
    }
    Alert.alert('Block is locked', 'Strict mode is on and this block is running. Open it to unlock with your PIN.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => navigation.navigate('ScheduleEditor', { scheduleId: schedule.id }) },
    ]);
  };
}
