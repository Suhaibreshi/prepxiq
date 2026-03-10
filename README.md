prepxiq

Authentication & OTP server
- A simple demo OTP server is included at `server/index.js`. It supports Twilio for sending WhatsApp or SMS OTPs when the following env vars are set: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `TWILIO_SMS_FROM`.
- To run the demo server locally:

```bash
cd server
npm install
npm start
```

- By default the server logs OTPs to the console (demo mode). In development the frontend expects the server at `http://localhost:4000`.

Frontend integration
- The app includes an auth context and a `Login` flow that sends OTP to the server endpoints `/api/send-otp` and `/api/verify-otp`.
- Click `Login` in the navbar to start the OTP flow. Access to course playlists is blocked unless logged in.
prepxiq
