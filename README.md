# HabitTracker

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Build for Android

To build and deploy the app for Android devices:

### Steps:

1. **Build the production version of the app:**

   ```bash
   ng build --configuration production
   ```

   This generates the production-ready web app in the `dist/` folder.

2. **Copy the build to Capacitor:**

   ```bash
   npx cap copy
   ```

3. **Open the Android project in Android Studio:**

   ```bash
   npx cap open android
   ```

4. **Build and Run the App**:
   - In Android Studio, click `Run` to install and run the app on an emulator or connected device.

## Features

### Profile Navigation

The app allows users to navigate to any user's profile by clicking on usernames throughout the interface. This feature enables seamless profile discovery and social interaction from various contexts:

- In the connections list, clicking any username will take you to that user's profile
- In habit cards, clicking on a friend's username will show their profile
- In notifications, usernames are clickable to view the sender's profile
- In cheers and comments, clicking usernames navigates to the respective user's profile

This design makes it easy to discover and connect with other users from any part of the application where usernames appear.
