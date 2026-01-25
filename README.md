# TippApp

A mobile App for Football Tips. Built with **Angular**, **Ionic**, and **Capacitor** as Frontend and **NestJs** for the Backend.

To run a database the project uses **Docker** with a **MySQL** database that is connected with **TypeORM** to the Backend.

For Frontend-UI-tests the project uses **Playwright**.

## Start Mobile-App locally

1. Start Backend and Database
   ``
   npm run env:dev
   ``
3. Start App as Web-version or as android-native-app with capacitor ``npm run local:mobile-app``

## Run Tests

- For **Unit-tests** you can run ``npm run test:all:unit``
- **UI-Tests** in the Frontend can be run with ``npm run test:mobile-app:e2e``
- **Backend-Tests** are runable with ``npm run test:backend:e2e``
  - to setup the test-environment with database and mockserver run first ``npm run env:test``
