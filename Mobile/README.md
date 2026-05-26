# LeaveApp — React Native Android

Employee Leave Management mobile app for Android.  
Connects to the Spring Boot backend running locally or on Render.

---

## App Identity

| Property | Value |
|---|---|
| **App Name** | LeaveApp |
| **Package** | com.leaveapp |
| **Version** | 1.0.0 |
| **Min SDK** | 23 (Android 6.0) |
| **Target SDK** | 34 (Android 14) |

---

## Prerequisites

Install all of these before starting:

| Tool | Version | Download |
|---|---|---|
| Node.js | ≥ 18 | https://nodejs.org |
| JDK | 17 (or 11) | https://adoptium.net |
| Android Studio | Latest | https://developer.android.com/studio |
| React Native CLI | Latest | `npm install -g react-native-cli` |

### VS Code Extensions (recommended)
- **React Native Tools** (Microsoft)
- **ES7+ React/Redux/React-Native snippets**
- **Prettier**
- **GitLens**

---

## Android Emulator Setup (Android Studio)

1. Open **Android Studio → Virtual Device Manager**
2. Click **Create Device**
3. Choose **Pixel 7** (or any phone)
4. Select system image **API 34 (Android 14)** — download if needed
5. Click **Finish** and then **Start (▶)**
6. Verify it appears in `adb devices`:
   ```
   adb devices
   # Should show: emulator-5554  device
   ```

---

## Project Setup

```bash
# 1. Install dependencies
cd LeaveApp
npm install

# 2. Install pods (iOS only — skip for Android)
# cd ios && pod install && cd ..

# 3. Start the backend first
#    Make sure your Spring Boot backend is running on port 8080.
#    The app uses http://10.0.2.2:8080/api
#    (10.0.2.2 is Android emulator's alias for your machine's localhost)

# 4. Start Metro bundler (in one terminal)
npm start

# 5. Run on Android emulator (in another terminal)
npm run android
```

---

## Emulator Network Notes

| What | Address |
|---|---|
| Your machine's localhost from the emulator | `10.0.2.2` |
| Backend API URL in the app | `http://10.0.2.2:8080/api` |

The `AndroidManifest.xml` already has `android:usesCleartextTraffic="true"` for dev HTTP access.  
In production, use HTTPS and remove that flag.

---

## Running in VS Code

1. Open the `LeaveApp` folder in VS Code
2. Open the integrated terminal (`Ctrl+\``)
3. Start Metro: `npm start`
4. Open a second terminal: `npm run android`

To debug with breakpoints:
- Press `Ctrl+Shift+D` → select **Debug Android**
- Or shake the emulator → **Debug with Chrome**

---

## Project Structure

```
LeaveApp/
├── App.tsx                         # Root component
├── index.js                        # Entry point
├── app.json                        # App name
├── package.json
├── android/
│   └── app/
│       ├── build.gradle
│       └── src/main/
│           ├── AndroidManifest.xml
│           ├── java/com/leaveapp/
│           │   ├── MainActivity.kt
│           │   └── MainApplication.kt
│           └── res/
│               ├── mipmap-*/       # App icons (all sizes)
│               ├── drawable/       # Splash background
│               └── values/         # strings.xml, styles.xml
└── src/
    ├── assets/icons/app_icon.svg   # Source icon
    ├── context/
    │   └── AuthContext.tsx         # Auth state + JWT storage
    ├── navigation/
    │   └── RootNavigator.tsx       # Stack navigator + auth gate
    ├── screens/
    │   ├── auth/LoginScreen.tsx
    │   ├── employee/EmployeeDashboard.tsx
    │   ├── manager/ManagerDashboard.tsx
    │   ├── leave/
    │   │   ├── ApplyLeaveScreen.tsx
    │   │   ├── MyLeavesScreen.tsx
    │   │   ├── LeaveBalanceScreen.tsx
    │   │   └── LeaveDetailScreen.tsx
    │   └── shared/
    │       ├── HolidaysScreen.tsx
    │       └── ProfileScreen.tsx
    ├── components/
    │   ├── common/
    │   │   ├── AppButton.tsx
    │   │   ├── AppInput.tsx
    │   │   ├── Header.tsx
    │   │   └── LoadingState.tsx
    │   └── leave/
    │       └── LeaveCards.tsx
    ├── services/
    │   ├── api.ts                  # Axios instance + JWT interceptor
    │   ├── authService.ts
    │   ├── employeeService.ts
    │   ├── leaveService.ts
    │   └── holidayService.ts
    └── utils/
        ├── theme.ts                # Colors, typography, spacing
        ├── constants.ts            # API URL, leave types
        └── helpers.ts              # Date formatting, helpers
```

---

## Default Login

```
Username: admin
Password: admin123
```

---

## Screen Overview

| Screen | Role | Description |
|---|---|---|
| Login | All | Gradient login with JWT auth |
| Employee Dashboard | Employee | Balances, quick actions, recent leaves, holidays |
| Manager Dashboard | Manager | Pending approvals + quick approve/reject, team list |
| Apply Leave | All | Leave type picker, date range, working day count |
| My Leaves | All | Filterable leave list (All/Pending/Approved/etc.) |
| Leave Balance | All | Visual progress bars per leave type |
| Leave Detail | All | Full leave info card |
| Holidays | All | Upcoming + past holidays calendar list |
| Profile | All | Employee info, navigation links, logout |

---

## Troubleshooting

**Metro not starting**
```bash
npm start -- --reset-cache
```

**Emulator not detected**
```bash
adb kill-server && adb start-server && adb devices
```

**Build fails — Gradle issues**
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

**Cannot connect to backend**  
Make sure:
- Spring Boot is running on port 8080
- You're using the Android emulator (not a physical device — physical devices need your machine's LAN IP)
- `android:usesCleartextTraffic="true"` is in `AndroidManifest.xml`

**react-native-vector-icons not showing**  
In `android/app/build.gradle` verify this line exists:
```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```
Then rebuild.
