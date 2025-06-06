import './assets/main.css';
import 'primeicons/primeicons.css';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import { createPinia } from 'pinia';
import router from './router';

import { createApp } from 'vue';
import App from './App.vue';

// ✅ Import PrimeVue & Tab Components
import PrimeVue from 'primevue/config';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

// 🔹 Initialize App
const app = createApp(App);

app.use(router);
app.use(Toast);
app.use(createPinia());
app.use(PrimeVue);

// ✅ Register PrimeVue Components Globally
app.component('TabView', TabView);
app.component('TabPanel', TabPanel);

app.mount('#app');
