import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import OrdersView from "@/views/OrdersView.vue";
import CatalogueView from "@/views/CatalogueView.vue";
import ProfileView from "@/views/ProfileView.vue";
import Dress from "@/views/Dress.vue";
import DressView from "@/views/DressView.vue";
import LoginView from "@/views/LoginView.vue";  // Import the LoginView component

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: {
                boutiqueName: "Chic Coutore"
            }
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView, // New route for the login page
        },
        {
            path: "/orders",
            name: "orders",
            component: OrdersView 
        },
        {
            path: "/catalogue",
            name: "catalogue",
            component: CatalogueView 
        },
        {
            path: "/catalogue/:id",
            name: "Dress-details",
            component: Dress 
        },
        {
            path: "/dress",
            name: "Dresses",
            component: DressView 
        },
        {
            path: "/profile",
            name: "profile",
            component: ProfileView
        },
    ]
})

export default router
