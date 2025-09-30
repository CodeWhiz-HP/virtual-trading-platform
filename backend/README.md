Backend API (Express + MongoDB Atlas + Firebase Admin)

Setup
1) Copy .env.example to .env and fill values:
   - GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
   - MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
   - CORS_ORIGIN=http://localhost:5173
   - PORT=5000
2) Download Firebase service account JSON from Firebase Console and place as backend/service-account-key.json
3) Install deps and run:
   - npm install
   - npm run dev

Routes
- GET /api/health
- GET /api/portfolio (auth required)
- POST /api/portfolio (auth required) { balance:number, portfolio:Record<string,number> }

Auth
Send Authorization: Bearer <idToken> where idToken is from Firebase client SDK (current user).
