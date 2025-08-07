# TippApp

A mobile App for Football Tips. Built with **Angular**, **Ionic**, and **Capacitor** as Frontend and **NestJs** for the Backend.

To run a database the project uses **Docker** with a **MySQL** database that is connected with **TypeORM** to the Backend.

For Frontend-UI-tests the project uses **Playwright**.

## Start Mobile-App locally

1. Start Database
   ``
   start:database
   ``

2. Start Backend
   ``
   start:backend
   ``
3. Start App as Web-version or as android-native-app with capacitor ``start:mobile-app``

## Run Tests

- For **Unit-tests** you can run ``test:all:unit``
- **UI-Tests** in the Frontend can be run with ``test:mobile-app:e2e``
- **Backend-Tests** are runable with ``test:backend:e2e``
  - Before that you have to start the mockserver to mock the external API (``start:mockserver``)

All Commands can be found in the package.json of the root-directory

## Current Nx-Graph:

![Nx-Graph](/assets/graph.png)
(15.07.2024)
