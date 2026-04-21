# Habit Tracker
IS4447 individual project by Colin O'Flynn.

A react rative habit tracking app built with Expo and Drizzle ORM. The user can create habits, group them into categories, log them daily, set weekly/monthly targets and view basic insights.

## setup

```
npm install
npx expo start
```

Then scan the QR code with Expo Go on your phone or press `a` to open the Android emulator.

## what I did in initial commit

I used the react-native-lab project from our labs as a starting point and extended it to suit the habit tracker.

- Set up the Expo project with expo-router and SQLite (via Drizzle ORM)
- Wrote the database schema with five tables: users, categories, habits, habit_logs, targets
- Wrote a seed script that populates all tables on first run so there is data to work with
- Built the tab layout (Today, Habits, Insights, Settings)
- Added placeholder screens that reads from the seeded data so I could confirm the database, context and routing all work together

The reusable components (FormField, PrimaryButton, ScreenHeader, InfoTag) are based on the components from the lab. 

## next plan
- go to canvas to finish 1-10 core 