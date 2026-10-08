import { environment } from '../environments/environment';

export const GlobalComponent = {
    // Api Calling
    API_URL: environment.apiUrl,

    headerToken: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },

    // Auth Api
    AUTH_API: environment.authApi,

    // WebSocket
    WS_SOS_LOCATION: environment.wsSosLocation,

    // Products Api
    product: 'apps/product',
    productDelete: 'apps/product/',

    // Orders Api
    order: 'apps/order',
    orderId: 'apps/order/',

    // Customers Api
    customer: 'apps/customer',
}
