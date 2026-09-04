import { useFonts } from 'expo-font';
import { Navigation } from './navigation/Navigation.js';

export const App = () => {
  const [fontsLoaded] = useFonts({
    'Roboto': require('@expo-google-fonts/roboto').Roboto_400Regular
  });

  if (!fontsLoaded) {
    return null;
  }

  return <Navigation />;
};
