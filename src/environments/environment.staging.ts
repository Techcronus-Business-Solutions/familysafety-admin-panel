export const environment = {
  production: true,
  defaultauth: 'fakebackend',
  mapboxToken: '',

  apiUrl: 'https://stagingapi.angelprotect-app.com/api/admin/',
  authApi: 'https://stagingapi.angelprotect-app.com/api/admin/',
  wsSosLocation: 'wss://stagingapi.angelprotect-app.com/ws/admin/location/',

  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  },
  digitalOceanSpaces: {
    accessKey: '__DO_SPACES_ACCESS_KEY__',
    secretKey: '__DO_SPACES_SECRET_KEY__',
    bucket: 'angel-protect-app-images',
    region: 'nyc3',
    endpoint: 'https://nyc3.digitaloceanspaces.com',
    cdnBase: 'https://angel-protect-app-images.nyc3.digitaloceanspaces.com'
  },
  mapbox: {
    publicKey: '__MAPBOX_PUBLIC_KEY__',
    secretKey: '__MAPBOX_SECRET_KEY__',
  }
};
