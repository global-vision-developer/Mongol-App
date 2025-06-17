# Altan Zam - Super App for China

This Next.js application, named "Altan Zam" (Golden Road), is designed as a comprehensive "super app" primarily aimed at users traveling to or residing in China. It offers a wide array of services and features to facilitate various needs.

## Core Features:

*   **Service Discovery:** Users can find and explore various services including:
    *   Flights
    *   Hotels
    *   Translators
    *   WeChat based services (e.g., payments, mini-programs)
    *   Markets and Shopping Centers
    *   Factories
    *   Hospitals
    *   Embassies and Consulates
*   **User Authentication & Profile:** Secure login and registration, with a comprehensive user profile section to manage personal information, contact details, password, and view order history.
*   **Service Booking & Orders:** Ability to book/order selected services directly through the app.
*   **Saved Items/Favorites:** Users can save services or items of interest for quick access later.
*   **Notifications:** In-app notification system for updates, order confirmations, and other relevant alerts. Firebase Cloud Messaging (FCM) is integrated for potential push notifications.
*   **Reviews & Ratings:** Users can submit ratings (1-10) and comments for services, helping other users make informed decisions.
*   **Multi-language Support:** The app supports Mongolian (mn) and Chinese (cn) languages.
*   **City-based Filtering:** Content and services can be filtered based on selected cities in China and Mongolia.
*   **Native App Capability:** Integrated with Capacitor to enable building and deploying as native Android and iOS applications.
*   **Firebase Backend:** Utilizes Firebase for authentication, Firestore database, and cloud messaging.

## Tech Stack:

*   **Frontend:** Next.js (App Router), React, TypeScript
*   **UI:** ShadCN UI components, Tailwind CSS
*   **Backend/BaaS:** Firebase (Authentication, Firestore, Cloud Messaging)
*   **Native Mobile:** Capacitor
*   **Generative AI (Planned/Integrated):** Genkit (though not extensively used in current visible features)

## Getting Started (Firebase Studio Environment):

This project is set up to run within Firebase Studio. The entry point for the main application view after login is `src/app/(main)/services/page.tsx`.

To get started with development or preview:
1.  Ensure your Firebase Studio environment is correctly configured.
2.  The application should typically auto-start in preview mode.
3.  Initial user flow will redirect to `/auth/login` if not authenticated, or `/services` if authenticated.
