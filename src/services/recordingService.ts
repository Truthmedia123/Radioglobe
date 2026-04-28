import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Audio } from 'expo-av';
import { Station } from '../api/radioBrowser';

export interface ScheduledRecording {
    id: string;
    station: Station;
    startTime: Date;
    duration: number; // in minutes
    title: string;
    status: 'scheduled' | 'recording' | 'completed' | 'failed';
    fileUri?: string;
    createdAt: Date;
}

export interface CompletedRecording {
    id: string;
    station: Station;
    recordedAt: Date;
    duration: number; // in seconds
    fileSize: number;
    title: string;
    fileUri: string;
}

class RecordingService {
    private recordings: ScheduledRecording[] = [];
    private completedRecordings: CompletedRecording[] = [];
    private isInitialized = false;

    /**
     * Initialize the recording service
     */
    async init() {
        if (this.isInitialized) return;

        // Configure notifications for recording
        await Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });

        // Define background task for recording
        TaskManager.defineTask('BACKGROUND_RECORDING', async ({ data, error }) => {
            if (error) {
                console.error('Background recording task error:', error);
                return;
            }

            const { recordingId } = data as { recordingId: string };
            await this.startRecordingFromBackground(recordingId);
        });

        this.isInitialized = true;
        console.log('Recording service initialized');
    }

    /**
     * Schedule a new recording
     */
    async scheduleRecording(
        station: Station,
        startTime: Date,
        duration: number,
        title: string
    ): Promise<ScheduledRecording> {
        const id = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const recording: ScheduledRecording = {
            id,
            station,
            startTime,
            duration,
            title,
            status: 'scheduled',
            createdAt: new Date(),
        };

        this.recordings.push(recording);

        // Schedule notification
        const triggerDate = new Date(startTime.getTime());
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Recording Starting',
                body: `Recording "${title}" for ${station.name} is about to start`,
                data: { recordingId: id },
            },
            trigger: {
                date: triggerDate,
            } as any, // Type workaround for expo-notifications
        });

        // Schedule background task (simplified - in real app would use exact trigger)
        console.log(`Recording scheduled: ${title} at ${startTime.toISOString()}`);

        return recording;
    }

    /**
     * Start recording from background task
     */
    private async startRecordingFromBackground(recordingId: string) {
        const recording = this.recordings.find(r => r.id === recordingId);
        if (!recording) {
            console.error(`Recording not found: ${recordingId}`);
            return;
        }

        console.log(`Starting recording from background: ${recording.title}`);

        // Update status
        recording.status = 'recording';

        try {
            // In a real implementation, this would:
            // 1. Start playing the stream silently
            // 2. Record the audio output
            // 3. Save to a file

            // For MVP, we'll simulate recording by creating a placeholder file
            await this.simulateRecording(recording);

            recording.status = 'completed';

            // Create completed recording entry
            const completed: CompletedRecording = {
                id: recording.id,
                station: recording.station,
                recordedAt: new Date(),
                duration: recording.duration * 60, // convert minutes to seconds
                fileSize: 1024 * 1024 * 5, // 5MB placeholder
                title: recording.title,
                fileUri: recording.fileUri || `file:///recordings/${recording.id}.m4a`,
            };

            this.completedRecordings.push(completed);

            // Send completion notification
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Recording Complete',
                    body: `Recording "${recording.title}" has been saved`,
                },
                trigger: null, // immediate
            });

        } catch (error) {
            console.error('Recording failed:', error);
            recording.status = 'failed';

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Recording Failed',
                    body: `Recording "${recording.title}" failed to complete`,
                },
                trigger: null,
            });
        }
    }

    /**
     * Simulate recording for MVP
     */
    private async simulateRecording(recording: ScheduledRecording): Promise<void> {
        console.log(`Simulating recording of ${recording.station.name} for ${recording.duration} minutes`);

        // Create a placeholder file path
        const fileName = `recording_${recording.id}.m4a`;
        // Use a mock file path for simulation
        const fileUri = `file:///mock/recordings/${fileName}`;

        // In a real implementation, we would actually record audio
        // For simulation, we just set the file URI
        recording.fileUri = fileUri;

        // Simulate recording time
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay for simulation

        console.log(`Recording simulation complete: ${fileUri}`);
    }

    /**
     * Get all scheduled recordings
     */
    getScheduledRecordings(): ScheduledRecording[] {
        return this.recordings.filter(r => r.status === 'scheduled');
    }

    /**
     * Get all completed recordings
     */
    getCompletedRecordings(): CompletedRecording[] {
        return this.completedRecordings;
    }

    /**
     * Get recording by ID
     */
    getRecording(id: string): ScheduledRecording | CompletedRecording | undefined {
        const scheduled = this.recordings.find(r => r.id === id);
        if (scheduled) return scheduled;

        return this.completedRecordings.find(r => r.id === id);
    }

    /**
     * Cancel a scheduled recording
     */
    async cancelRecording(id: string): Promise<boolean> {
        const index = this.recordings.findIndex(r => r.id === id);
        if (index === -1) return false;

        const recording = this.recordings[index];

        // Cancel notification (simplified - would need to store notification ID)
        console.log(`Cancelling recording: ${recording.title}`);

        // Remove from array
        this.recordings.splice(index, 1);

        return true;
    }

    /**
     * Delete a completed recording
     */
    async deleteRecording(id: string): Promise<boolean> {
        const index = this.completedRecordings.findIndex(r => r.id === id);
        if (index === -1) return false;

        const recording = this.completedRecordings[index];

        try {
            // Delete the file
            if (recording.fileUri) {
                await FileSystem.deleteAsync(recording.fileUri);
            }
        } catch (error) {
            console.warn('Failed to delete recording file:', error);
        }

        // Remove from array
        this.completedRecordings.splice(index, 1);

        return true;
    }

    /**
     * Play a completed recording
     */
    async playRecording(recording: CompletedRecording) {
        console.log(`Playing recording: ${recording.title}`);

        // In a real implementation, this would use the audio service
        // For now, just log
        return { success: true, message: 'Recording playback would start here' };
    }
}

export const recordingService = new RecordingService();