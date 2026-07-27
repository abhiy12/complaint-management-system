export const environment = {
  production: true,
  // Angular bakes these in at BUILD time — there's no runtime env var
  // injection for a static site on Render, so these must be the real
  // deployed backend URL before you run `ng build --configuration production`.
  // Example once your backend service is live: 'https://cms-backend-xxxx.onrender.com/api'
  apiUrl: 'https://YOUR-BACKEND-SERVICE.onrender.com/api',
  socketUrl: 'https://YOUR-BACKEND-SERVICE.onrender.com',
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
};
