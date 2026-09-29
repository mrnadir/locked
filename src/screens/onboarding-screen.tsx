import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { OnboardingSlides, type OnboardingSlide } from '@/constants/content';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RootStackScreenProps } from '@/navigation/types';

export function OnboardingScreen({ navigation }: RootStackScreenProps<'Onboarding'>) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === OnboardingSlides.length - 1;

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const goNext = () => {
    if (isLast) {
      navigation.navigate('Permissions');
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    setIndex(index + 1);
  };

  return (
    <Screen
      padded={false}
      edges={['top', 'bottom']}
      footer={
        <>
          <View style={styles.dots}>
            {OnboardingSlides.map((s, i) => (
              <View
                key={s.key}
                style={[
                  styles.dot,
                  { backgroundColor: i === index ? colors.primary : colors.border },
                  i === index && styles.dotActive,
                ]}
              />
            ))}
          </View>
          <Button title={isLast ? 'Get started' : 'Next'} onPress={goNext} icon={isLast ? 'arrow-forward' : undefined} />
        </>
      }>
      <View style={styles.topBar}>
        {!isLast && (
          <Pressable onPress={() => navigation.navigate('Permissions')} hitSlop={12}>
            <AppText variant="label" color="textSecondary">
              Skip
            </AppText>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={OnboardingSlides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.illustration, { backgroundColor: colors.primarySoft }]}>
              <View style={[styles.illustrationInner, { backgroundColor: colors.primary }]}>
                <Ionicons name={item.icon} size={64} color={colors.white} />
              </View>
            </View>
            <AppText variant="title" align="center">
              {item.title}
            </AppText>
            <AppText color="textSecondary" align="center" style={styles.description}>
              {item.description}
            </AppText>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { height: 44, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.lg },
  illustration: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  illustrationInner: {
    width: 140,
    height: 140,
    borderRadius: Radius.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: { maxWidth: 320 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
});
