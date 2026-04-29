import { registerRootComponent } from 'expo';
import TrackPlayer, { Capability } from 'react-native-track-player';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

TrackPlayer.registerPlaybackService(() => require('./src/service'));

TrackPlayer.setupPlayer({
    // waitForBuffer is not in the type definitions but may be supported
    // Removing to fix TypeScript error
}).then(() => {
    TrackPlayer.updateOptions({
        capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    });
});
