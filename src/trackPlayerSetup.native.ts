import TrackPlayer, { Capability } from 'react-native-track-player';

export const setupTrackPlayer = () => {
  TrackPlayer.registerPlaybackService(() => require('./service'));

  TrackPlayer.setupPlayer({}).then(() => {
    TrackPlayer.updateOptions({
      capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    });
  });
};
