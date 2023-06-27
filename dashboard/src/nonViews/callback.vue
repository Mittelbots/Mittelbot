<template>
    {{ error }}
</template>

<script>
import { setCookie } from '@/assets/js/functions/utils/cookies';

export default {
    name: 'Callback',
    data() {
        return {
            error: null,
        };
    },
    async created() {
        const code = this.$route.query.code;

        if (!code) {
            this.$router.push({ path: 'login' });
            return;
        }

        const response = await fetch(`${process.env.VUE_APP_API_URL}/auth`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-code': code,
            },
        });

        console.log(response);
        return;
        if (response.status !== 200) {
            setCookie('discord_auth_code', code);
            this.$router.push({ path: '/' });
            return;
        } else {
            this.error = 'Authentication failed. Please try again.';
        }
    },
};
</script>
