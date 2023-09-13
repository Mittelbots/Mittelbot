import { createRouter, createWebHistory } from 'vue-router';
import isLoggedIn from '@/assets/js/functions/auth/isLoggedIn';

const routes = [
    {
        path: '/',
        name: 'Mittelbot Dashboard',
        beforeEnter: async (to, from, next) => {
            const loggedIn = await isLoggedIn();
            if (loggedIn) {
                next();
                return;
            } else {
                next('/login');
                return;
            }
        },
    },
    {
        path: '/login',
        name: 'Discord Login',
        beforeEnter: (to, from, next) => {
            console.log(process.env.VUE_APP_OAUTH_URL);
            window.location.href = process.env.VUE_APP_OAUTH_URL;
            return;
        },
    },
    {
        path: '/callback',
        name: 'Discord Callback',
        component: () => import('@/nonViews/callback.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
