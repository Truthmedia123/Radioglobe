import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { audioService } from './audioService';
import { Station } from '../api/radioBrowser';

export interface Alarm {
    id: string;
    name: string;
    time: Date; // Time of day (hours, minutes)
    days: number[]; // 0-6 for Sunday-Saturday
    station?: Station; // Radio station to wake up to
    stationUrl?: string; // Fallback URL if station not available
    useFallbackTone: boolean; // If true, use local alarm tone instead of radio
    enabled: boolean;
    snoozeMinutes: number; // Default 5 minutes
    volume: number; // 0.0 to 1.0
    createdAt: Date;
    lastTriggered?: Date;
}

export interface AlarmTrigger {
    alarmId: string;
    triggerTime: Date;
    notificationId?: string;
    taskName?: string;
}

const ALARM_TASK_NAME = 'ALARM_TRIGGER_TASK';
const ALARM_STORAGE_KEY = '@radioglobe_alarms';
const ALARM_TRIGGERS_KEY = '@radioglobe_alarm_triggers';

// Configure notifications for alarms
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

class AlarmService {
    private alarms: Alarm[] = [];
    private triggers: AlarmTrigger[] = [];

    constructor() {
        this.init();
    }

    async init() {
        await this.loadAlarms();
        await this.loadTriggers();
        await this.registerBackgroundTask();
        await this.setupNotificationChannels();
    }

    private async setupNotificationChannels() {
        if (Platform.OS === 'android') {
            try {
                await Notifications.setNotificationChannelAsync('alarms', {
                    name: 'Alarms',
                    importance: Notifications.AndroidImportance.HIGH,
                    sound: 'alarm_sound.wav', // This would need actual sound file
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
                });
            } catch (error) {
                console.warn('Failed to setup notification channel:', error);
            }
        }
    }

    private async registerBackgroundTask() {
        try {
            TaskManager.defineTask(ALARM_TASK_NAME, async () => {
                await this.handleAlarmTrigger();
                return { success: true };
            });

            // Note: In a real implementation, we would register the background task
            // using expo-task-manager's registerTaskAsync. However, for simplicity
            // and to avoid complex background task setup, we'll rely on scheduled
            // notifications to trigger alarms.
            console.log('Alarm background task defined (would need proper registration)');
        } catch (error) {
            console.warn('Failed to register alarm background task:', error);
        }
    }

    async loadAlarms(): Promise<Alarm[]> {
        try {
            const stored = await AsyncStorage.getItem(ALARM_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.alarms = parsed.map((alarm: any) => ({
                    ...alarm,
                    time: new Date(alarm.time),
                    createdAt: new Date(alarm.createdAt),
                    lastTriggered: alarm.lastTriggered ? new Date(alarm.lastTriggered) : undefined,
                }));
            }
            return this.alarms;
        } catch (error) {
            console.error('Failed to load alarms:', error);
            return [];
        }
    }

    async loadTriggers(): Promise<AlarmTrigger[]> {
        try {
            const stored = await AsyncStorage.getItem(ALARM_TRIGGERS_KEY);
            if (stored) {
                this.triggers = JSON.parse(stored).map((trigger: any) => ({
                    ...trigger,
                    triggerTime: new Date(trigger.triggerTime),
                }));
            }
            return this.triggers;
        } catch (error) {
            console.error('Failed to load alarm triggers:', error);
            return [];
        }
    }

    async saveAlarms() {
        try {
            await AsyncStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(this.alarms));
        } catch (error) {
            console.error('Failed to save alarms:', error);
        }
    }

    async saveTriggers() {
        try {
            await AsyncStorage.setItem(ALARM_TRIGGERS_KEY, JSON.stringify(this.triggers));
        } catch (error) {
            console.error('Failed to save alarm triggers:', error);
        }
    }

    async createAlarm(alarmData: Omit<Alarm, 'id' | 'createdAt'>): Promise<Alarm> {
        const alarm: Alarm = {
            ...alarmData,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
        };

        this.alarms.push(alarm);
        await this.saveAlarms();

        if (alarm.enabled) {
            await this.scheduleAlarm(alarm);
        }

        return alarm;
    }

    async updateAlarm(id: string, updates: Partial<Alarm>): Promise<Alarm | null> {
        const index = this.alarms.findIndex(a => a.id === id);
        if (index === -1) return null;

        const oldAlarm = this.alarms[index];
        const updatedAlarm = { ...oldAlarm, ...updates };

        this.alarms[index] = updatedAlarm;
        await this.saveAlarms();

        // Reschedule if enabled status changed or time/days changed
        if (oldAlarm.enabled !== updatedAlarm.enabled ||
            oldAlarm.time.getTime() !== updatedAlarm.time.getTime() ||
            JSON.stringify(oldAlarm.days) !== JSON.stringify(updatedAlarm.days)) {
            await this.cancelAlarmSchedule(oldAlarm);
            if (updatedAlarm.enabled) {
                await this.scheduleAlarm(updatedAlarm);
            }
        }

        return updatedAlarm;
    }

    async deleteAlarm(id: string): Promise<boolean> {
        const alarm = this.alarms.find(a => a.id === id);
        if (!alarm) return false;

        await this.cancelAlarmSchedule(alarm);

        this.alarms = this.alarms.filter(a => a.id !== id);
        await this.saveAlarms();
        return true;
    }

    async toggleAlarm(id: string): Promise<Alarm | null> {
        const alarm = this.alarms.find(a => a.id === id);
        if (!alarm) return null;

        return await this.updateAlarm(id, { enabled: !alarm.enabled });
    }

    async scheduleAlarm(alarm: Alarm) {
        // Cancel any existing triggers for this alarm
        await this.cancelAlarmSchedule(alarm);

        // Calculate next trigger times for each day
        const now = new Date();
        const triggers: AlarmTrigger[] = [];

        for (const day of alarm.days) {
            const triggerTime = this.calculateNextTriggerTime(alarm.time, day);
            if (triggerTime > now) {
                const trigger: AlarmTrigger = {
                    alarmId: alarm.id,
                    triggerTime,
                };

                // Schedule notification
                const notificationId = await this.scheduleNotification(alarm, triggerTime);
                trigger.notificationId = notificationId;

                triggers.push(trigger);
            }
        }

        this.triggers.push(...triggers);
        await this.saveTriggers();
    }

    async cancelAlarmSchedule(alarm: Alarm) {
        // Remove triggers for this alarm
        const triggersToRemove = this.triggers.filter(t => t.alarmId === alarm.id);

        // Cancel notifications
        for (const trigger of triggersToRemove) {
            if (trigger.notificationId) {
                await Notifications.cancelScheduledNotificationAsync(trigger.notificationId);
            }
        }

        // Remove from triggers array
        this.triggers = this.triggers.filter(t => t.alarmId !== alarm.id);
        await this.saveTriggers();
    }

    private calculateNextTriggerTime(alarmTime: Date, dayOfWeek: number): Date {
        const now = new Date();
        const target = new Date(now);

        // Set to alarm time
        target.setHours(alarmTime.getHours(), alarmTime.getMinutes(), 0, 0);

        // Adjust to correct day of week
        const currentDay = now.getDay();
        let daysToAdd = dayOfWeek - currentDay;
        if (daysToAdd < 0 || (daysToAdd === 0 && target <= now)) {
            daysToAdd += 7;
        }

        target.setDate(target.getDate() + daysToAdd);
        return target;
    }

    private async scheduleNotification(alarm: Alarm, triggerTime: Date): Promise<string> {
        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Wake Up to the World!',
                body: `Time to wake up to ${alarm.station?.name || 'your alarm'}`,
                sound: 'alarm_sound.wav',
                data: { alarmId: alarm.id },
            },
            trigger: {
                date: triggerTime,
                channelId: 'alarms',
            },
        });

        return identifier;
    }

    async handleAlarmTrigger() {
        const now = new Date();
        const triggered = this.triggers.filter(t => t.triggerTime <= now);

        for (const trigger of triggered) {
            const alarm = this.alarms.find(a => a.id === trigger.alarmId);
            if (!alarm || !alarm.enabled) continue;

            // Update last triggered time
            await this.updateAlarm(alarm.id, { lastTriggered: now });

            // Play alarm
            await this.playAlarm(alarm);

            // Remove this trigger (it will be rescheduled for next occurrence)
            this.triggers = this.triggers.filter(t =>
                !(t.alarmId === trigger.alarmId && t.triggerTime.getTime() === trigger.triggerTime.getTime())
            );

            // Cancel notification
            if (trigger.notificationId) {
                await Notifications.cancelScheduledNotificationAsync(trigger.notificationId);
            }
        }

        await this.saveTriggers();
    }

    async playAlarm(alarm: Alarm) {
        try {
            // Set volume
            await audioService.setVolume(alarm.volume);

            if (alarm.useFallbackTone) {
                // Play local alarm tone (would need actual audio file)
                // For now, we'll just play a test tone
                console.log('Playing fallback alarm tone');
                // In a real implementation, you would play a local audio file
            } else if (alarm.stationUrl) {
                // Play radio station
                await audioService.play(alarm.stationUrl);
            } else if (alarm.station?.url_resolved) {
                // Play from station object
                await audioService.play(alarm.station.url_resolved);
            } else {
                console.warn('No audio source for alarm');
            }
        } catch (error) {
            console.error('Failed to play alarm:', error);
        }
    }

    async snoozeAlarm(alarmId: string) {
        const alarm = this.alarms.find(a => a.id === alarmId);
        if (!alarm) return;

        // Stop current audio
        await audioService.stop();

        // Schedule new alarm in snoozeMinutes
        const snoozeTime = new Date(Date.now() + alarm.snoozeMinutes * 60 * 1000);

        const trigger: AlarmTrigger = {
            alarmId: alarm.id,
            triggerTime: snoozeTime,
        };

        // Schedule notification
        const notificationId = await this.scheduleNotification(alarm, snoozeTime);
        trigger.notificationId = notificationId;

        this.triggers.push(trigger);
        await this.saveTriggers();
    }

    async dismissAlarm(alarmId: string) {
        await audioService.stop();

        // Remove any pending triggers for this alarm (except future scheduled ones)
        const now = new Date();
        this.triggers = this.triggers.filter(t =>
            !(t.alarmId === alarmId && t.triggerTime <= now)
        );
        await this.saveTriggers();
    }

    getAlarms(): Alarm[] {
        return [...this.alarms];
    }

    getAlarm(id: string): Alarm | undefined {
        return this.alarms.find(a => a.id === id);
    }

    getUpcomingAlarms(limit: number = 5): { alarm: Alarm; nextTrigger: Date }[] {
        const upcoming: { alarm: Alarm; nextTrigger: Date }[] = [];

        for (const alarm of this.alarms.filter(a => a.enabled)) {
            const triggers = this.triggers
                .filter(t => t.alarmId === alarm.id)
                .map(t => t.triggerTime)
                .sort((a, b) => a.getTime() - b.getTime());

            if (triggers.length > 0) {
                upcoming.push({ alarm, nextTrigger: triggers[0] });
            }
        }

        return upcoming
            .sort((a, b) => a.nextTrigger.getTime() - b.nextTrigger.getTime())
            .slice(0, limit);
    }
}

export const alarmService = new AlarmService();