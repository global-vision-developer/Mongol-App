import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.altanzam.app', // Та өөрийн app ID-г энд оруулна уу
  appName: 'Altan Zam',      // Та өөрийн app нэрийг энд оруулна уу
  webDir: 'out',             // Next.js static export хийсэн үед гарах хавтас
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff", // Таны аппын үндсэн дэвсгэр өнгө (жишээ нь, globals.css-с)
      // androidSplashResourceName: "splash", // Android splash screen нөөцийн нэр
      // iosSplashResourceName: "Splash", // iOS splash screen нөөцийн нэр (Storyboard ID)
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#3F51B5', // Таны аппын үндсэн өнгө (жишээ нь, primary color)
    },
  },
};

export default config;
