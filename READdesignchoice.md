📂 Project Structure Rationale
This project uses a feature-based, file-system routing approach inspired by Expo Router and Next.js, instead of the classic React Native folder structure (screens, navigation, components).

✨ Why This Approach?
File-Based Routing:
The app/ directory automatically maps files to navigation routes, reducing boilerplate and making navigation easier to scale as the app grows.

Colocation of Features:
Screens, layouts, and assets related to a specific feature (e.g., track) live together in the same folder, improving maintainability and discoverability.

Consistent Layouts and Error Handling:
Using _layout.tsx and +not-found.tsx provides built-in conventions for shared layouts and route-level error screens.

Modern, Scalable Convention:
This approach aligns with modern React Native and Expo best practices and supports large apps with complex navigation.

Reduced Configuration Overhead:
Less manual navigation configuration is needed compared to traditional navigation and screens folders.

🆚 Compared to the Classic Approach
Classic Structure (screens, navigation)	Current Approach (app/ file routing)
Manual route and stack configuration	Automatic route mapping
Features spread across multiple folders	Features colocated in a single folder
Familiar to most React Native developers	Inspired by Expo Router conventions
Easier for very small apps	Scales better for large apps

We chose this setup to future-proof the project, reduce boilerplate, and keep related code organized together as the app grows.