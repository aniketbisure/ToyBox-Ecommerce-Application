# Running the Ecommerce Project

This guide provides the commands needed to run both the backend and frontend.

---

## 1. Start the Backend & Database
Open a terminal and run:
```powershell
cd backend
npm run dev
```
*Note: Ensure your MongoDB is connected. If you need test data, run `npm run seed`.*

---

## 2. Start the Metro Bundler
Open a **new** terminal and run:
```powershell
npm start
```
*Tip: If you encounter port errors, run `npm start -- --clear-cache`.*

---

## 3. Run on Physical Device (USB)
1. **Connect your phone** via USB and ensure "USB Debugging" is enabled.
2. **Setup Port Forwarding** (Very Important):
   ```powershell
   adb reverse tcp:8081 tcp:8081
   adb reverse tcp:5000 tcp:5000
   ```
3. **Launch the App**:
   ```powershell
   npm run android
   ```

---

## 4. Run on Android Emulator
1. **Open Android Studio** and start your Virtual Device (AVD).
2. **Launch the App**:
   ```powershell
   npm run android
   ```

---

## Troubleshooting Common Issues

### "The filename, directory name, or volume label syntax is incorrect"
This is caused by a space in your `ANDROID_HOME` variable. 
**Fix:** Remove the leading space in your Environment Variables and restart your terminal.

### Port 8081 is already in use
Run this in PowerShell to kill the process:
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess -Force
```

### Login Failed
1. Ensure the backend is running.
2. Ensure you ran `adb reverse tcp:5000 tcp:5000`.
3. Use the test account: **test@example.com** / **password123**.
