export const GlobalComponent = {
    // Api Calling
    // API_URL: 'https://44f1-122-170-11-199.ngrok-free.app/api/admin/', // Local URL
    // API_URL: 'http://192.168.1.146:8000/api/admin/', // Local URL
    // API_URL: 'https://api.angelprotect-app.com/api/admin/', // Live URL
    API_URL: 'https://stagingapi.angelprotect-app.com/api/admin/', // Live URL

    headerToken: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },

    // Auth Api
    // AUTH_API: "https://44f1-122-170-11-199.ngrok-free.app/api/admin/", // Local URL
    // AUTH_API: "http://192.168.1.146:8000/api/admin/", // Local URL
    // AUTH_API: "https://api.angelprotect-app.com/api/admin/", // Live URL
    AUTH_API: "https://stagingapi.angelprotect-app.com/api/admin/", // Live URL

    // WebSocket
    // WS_SOS_LOCATION: 'ws://44f1-122-170-11-199.ngrok-free.app/ws/admin/location/', // Local URL
    // WS_SOS_LOCATION: 'ws://192.168.1.146:8000/ws/admin/location/', // Local URL
    // WS_SOS_LOCATION: 'wss://api.angelprotect-app.com/ws/admin/location/', // Live URL
    WS_SOS_LOCATION: 'wss://stagingapi.angelprotect-app.com/ws/admin/location/', // Live URL


    // Products Api
    product: 'apps/product',
    productDelete: 'apps/product/',

    // Orders Api
    order: 'apps/order',
    orderId: 'apps/order/',

    // Customers Api
    customer: 'apps/customer',
}