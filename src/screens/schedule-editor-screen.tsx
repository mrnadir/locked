import { AppConfig } from "@config";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLayoutEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { AppListItem } from "@/components/app-list-item";
import { PinSheet } from "@/components/pin-sheet";
import { TimePickerField } from "@/components/time-picker-field";
import { AppIcon } from "@/components/ui/app-icon";
import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Screen } from "@/components/ui/screen";
import { SearchBar } from "@/components/ui/search-bar";
import { WeekDays } from "@/constants/content";
import { FontSize, Radius, Spacing } from "@/constants/theme";
import type { Schedule } from "@/constants/types";
import { useBlocker } from "@/context/blocker-context";
import { useSettings } from "@/context/settings-context";
import { useTheme } from "@/hooks/use-theme";
import type { RootStackScreenProps } from "@/navigation/types";
import { getNextWindow, isScheduleLocked } from "@/utils/block-status";
import {
  createId,
  formatClock,
  formatDayLabel,
  formatMinutes,
} from "@/utils/format";

type Step = "apps" | "time";
type RepeatMode = "daily" | "custom";

const RepeatOptions: { id: RepeatMode; label: string }[] = [
  { id: "daily", label: "Every day" },
  { id: "custom", label: "Custom" },
];

const MAX_APPS = AppConfig.limits.maxBlockedApps;
const DAY_MINUTES = 24 * 60;

function repeatModeOf(schedule: Schedule): RepeatMode {
  if (schedule.date) return "custom";
  const key = [...schedule.days].sort().join();
  return key === "0,1,2,3,4,5,6" ? "daily" : "custom";
}

function initialCustomDays(schedule: Schedule | undefined): number[] {
  if (schedule?.date) return [new Date(`${schedule.date}T12:00:00`).getDay()];
  return schedule?.days ?? [new Date().getDay()];
}

function daysFor(mode: RepeatMode, customDays: number[]): number[] {
  return mode === "daily" ? [0, 1, 2, 3, 4, 5, 6] : customDays;
}

function nextFullHour(): number {
  const d = new Date();
  return ((d.getHours() + 1) % 24) * 60;
}

export function ScheduleEditorScreen({
  navigation,
  route,
}: RootStackScreenProps<"ScheduleEditor">) {
  const { colors } = useTheme();
  const { settings, completeOnboarding } = useSettings();
  const {
    schedules,
    saveSchedule,
    deleteSchedule,
    installedApps,
    blockedAppIds,
    getApp,
  } = useBlocker();
  const existing = schedules.find((s) => s.id === route.params?.scheduleId);
  const presetAppIds = route.params?.appIds;
  const fromOnboarding = route.params?.fromOnboarding ?? false;
  const cameFromPicker = !!presetAppIds;

  const [step, setStep] = useState<Step>(
    existing || cameFromPicker ? "time" : "apps",
  );
  const [selected, setSelected] = useState<string[]>(
    () =>
      presetAppIds ??
      (existing?.appIds?.length ? existing.appIds : blockedAppIds),
  );
  const [query, setQuery] = useState("");
  const [name, setName] = useState(existing?.name ?? "");
  const [startMinutes, setStartMinutes] = useState(
    () => existing?.startMinutes ?? nextFullHour(),
  );
  const [endMinutes, setEndMinutes] = useState(
    () => existing?.endMinutes ?? (nextFullHour() + 60) % DAY_MINUTES,
  );
  const [repeat, setRepeat] = useState<RepeatMode>(
    existing ? repeatModeOf(existing) : "daily",
  );
  const [customDays, setCustomDays] = useState<number[]>(() =>
    initialCustomDays(existing),
  );

  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);

  const unlockPin = settings.pin;
  const locked =
    !!existing &&
    !pinUnlocked &&
    isScheduleLocked(existing, settings.strictMode, new Date());

  const openUnlock = () => setUnlockOpen(true);

  useLayoutEffect(() => {
    navigation.setOptions({ title: existing ? "Edit block" : "New block" });
  }, [navigation, existing]);

  const now = new Date();
  const draft: Schedule = {
    id: existing?.id ?? "",
    name: name.trim() || "Scheduled block",
    startMinutes,
    endMinutes,
    days: daysFor(repeat, customDays),
    enabled: existing?.enabled ?? true,
    appIds: selected,
  };
  const nextWindow = getNextWindow(draft, now);
  const durationMinutes =
    endMinutes > startMinutes
      ? endMinutes - startMinutes
      : DAY_MINUTES - startMinutes + endMinutes;

  const toggleApp = (appId: string) => {
    if (selected.includes(appId)) {
      setSelected(selected.filter((id) => id !== appId));
    } else if (selected.length >= MAX_APPS) {
      Alert.alert("Limit reached", `You can pick up to ${MAX_APPS} apps.`);
    } else {
      setSelected([...selected, appId]);
    }
  };

  const toggleDay = (day: number) =>
    setCustomDays(
      customDays.includes(day)
        ? customDays.filter((d) => d !== day)
        : [...customDays, day],
    );

  const save = () => {
    if (selected.length === 0) {
      setStep("apps");
      return;
    }
    if (draft.days.length === 0) {
      Alert.alert("Pick a day", "Select at least one day for this block.");
      return;
    }
    saveSchedule({ ...draft, id: draft.id || createId() });
    if (fromOnboarding) {
      completeOnboarding();
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    } else if (cameFromPicker) {
      navigation.popTo("Main");
    } else {
      navigation.goBack();
    }
  };

  const changeApps = () =>
    cameFromPicker ? navigation.goBack() : setStep("apps");

  const remove = () => {
    if (!existing) return;
    Alert.alert("Delete block?", `“${existing.name}” will be removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteSchedule(existing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const stepper = (
    <View style={styles.steps}>
      {(["apps", "time"] as Step[]).map((s, i) => {
        const active = step === s;
        return (
          <Pressable
            key={s}
            onPress={() => (s === "apps" || selected.length > 0) && setStep(s)}
            style={styles.stepItem}
          >
            <View
              style={[
                styles.stepBar,
                {
                  backgroundColor:
                    active || i === 0 ? colors.primary : colors.border,
                },
              ]}
            />
            <AppText variant="caption" color={active ? "primary" : "textMuted"}>
              {i + 1}. {s === "apps" ? "Choose apps" : "Set time"}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );

  if (step === "apps") {
    const q = query.trim().toLowerCase();
    const visibleApps = installedApps.filter(
      (a) => q === "" || a.name.toLowerCase().includes(q),
    );

    return (
      <Screen
        edges={["bottom"]}
        padded={false}
        footer={
          <Button
            title={
              selected.length === 0
                ? "Select at least one app"
                : `Next · ${selected.length} apps`
            }
            icon="arrow-forward"
            disabled={selected.length === 0}
            onPress={() => setStep("time")}
          />
        }
      >
        <View style={styles.appsHeader}>
          {stepper}
          <AppText variant="title">Which apps?</AppText>
          <AppText color="textSecondary">
            {selected.length} of {installedApps.length} selected · max{" "}
            {MAX_APPS}
          </AppText>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search apps"
          />
        </View>
        <FlatList
          data={visibleApps}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <AppListItem
              app={item}
              selected={selected.includes(item.id)}
              onPress={() => toggleApp(item.id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState icon="search" title="No apps found" />
          }
        />
      </Screen>
    );
  }

  const selectedApps = selected.map(getApp).filter((a) => a !== undefined);

  return (
    <Screen
      edges={["bottom"]}
      padded={false}
      footer={
        <>
          <Button
            title={existing ? "Save changes" : "Confirm and block"}
            icon="lock-closed"
            onPress={save}
            disabled={locked}
          />
          {existing && (
            <Button
              title="Delete"
              variant="danger"
              onPress={remove}
              disabled={locked}
            />
          )}
        </>
      }
    >
      <ScrollView
        contentContainerStyle={styles.timeContent}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {!cameFromPicker && stepper}

        {locked && (
          <Card
            style={[
              styles.lockCard,
              {
                backgroundColor: colors.warningSoft,
                borderColor: colors.warning,
              },
            ]}
          >
            <AppText variant="label" color="warning">
              Strict mode: this block is running right now and cannot be
              changed.
            </AppText>
            {unlockPin ? (
              <Button
                title="Unlock with PIN"
                icon="keypad"
                size="md"
                color={colors.warning}
                onPress={openUnlock}
              />
            ) : (
              <AppText variant="caption" color="textSecondary">
                No PIN is set, so this block can&apos;t be unlocked early. Set a
                PIN in Unlock rules before turning on strict mode.
              </AppText>
            )}
          </Card>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="heading">Selected apps</AppText>
            <Pressable onPress={changeApps} hitSlop={10} disabled={locked}>
              <AppText variant="label" color="primary">
                Change
              </AppText>
            </Pressable>
          </View>
          <Card style={styles.appsList}>
            {selectedApps.map((app) => (
              <View key={app.id} accessible accessibilityLabel={app.name}>
                <AppIcon app={app} size={44} />
              </View>
            ))}
          </Card>
        </View>

        <AppText variant="heading">When to block</AppText>

        <View style={styles.timeRow}>
          <TimePickerField
            label="From"
            minutes={startMinutes}
            onChange={setStartMinutes}
            disabled={locked}
          />
          <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
          <TimePickerField
            label="To"
            minutes={endMinutes}
            onChange={setEndMinutes}
            disabled={locked}
          />
        </View>

        <AppText variant="heading">Duration</AppText>
        <Card
          style={[
            styles.summary,
            {
              backgroundColor: colors.primarySoft,
              borderColor: colors.primarySoft,
            },
          ]}
        >
          <Ionicons name="hourglass" size={35} color={colors.primary} />
          <View style={styles.summaryText}>
            <AppText variant="label">
              {formatMinutes(durationMinutes)} block ·{" "}
              {formatClock(startMinutes)} – {formatClock(endMinutes)}
              {endMinutes <= startMinutes ? " (next day)" : ""}
            </AppText>
            {nextWindow && (
              <AppText variant="caption" color="textSecondary">
                {nextWindow.start <= now.getTime()
                  ? "Starts right away"
                  : `${formatDayLabel(nextWindow.start, now)} · starts in ${formatMinutes(
                      Math.ceil((nextWindow.start - now.getTime()) / 60_000),
                    )}`}
              </AppText>
            )}
          </View>
        </Card>

        <View style={styles.field}>
          <AppText variant="heading">Repeat</AppText>
          <View style={styles.chips}>
            {RepeatOptions.map((o) => (
              <Chip
                key={o.id}
                label={o.label}
                selected={repeat === o.id}
                onPress={() => setRepeat(o.id)}
              />
            ))}
          </View>
          {repeat === "custom" && (
            <View style={styles.days}>
              {WeekDays.map((label, day) => {
                const on = customDays.includes(day);
                return (
                  <Pressable
                    key={label}
                    onPress={() => toggleDay(day)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={label}
                    style={[
                      styles.day,
                      {
                        backgroundColor: on ? colors.primary : colors.card,
                        borderColor: on ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={{
                        color: on ? colors.white : colors.textSecondary,
                        fontWeight: "700",
                      }}
                    >
                      {label.charAt(0)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <AppText variant="heading">Session name</AppText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Study time"
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              },
            ]}
          />
        </View>
      </ScrollView>

      <PinSheet
        visible={unlockOpen}
        expectedPin={unlockPin}
        hint="To unlock this block"
        onClose={() => setUnlockOpen(false)}
        onSuccess={() => {
          setPinUnlocked(true);
          setUnlockOpen(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  steps: { flexDirection: "row", gap: Spacing.sm },
  stepItem: { flex: 1, gap: Spacing.xs },
  stepBar: { height: 4, borderRadius: Radius.full },
  appsHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  timeContent: { padding: Spacing.lg, gap: Spacing.lg },
  lockCard: { gap: Spacing.md },
  section: { gap: Spacing.sm },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  timeRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  summary: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  summaryText: { flex: 1, gap: 2 },
  field: { gap: Spacing.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  days: { flexDirection: "row", justifyContent: "space-between" },
  day: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 50,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.md,
  },
});
