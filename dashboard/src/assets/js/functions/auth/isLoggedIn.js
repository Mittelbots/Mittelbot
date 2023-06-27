import { getCookie } from '@/assets/js/functions/utils/cookies';

async function isLoggedIn() {
    const token = getCookie('token');

    if (
        !token ||
        token === '' ||
        token === ' ' ||
        token === undefined ||
        token === null ||
        token === 'null' ||
        token === 'undefined'
    ) {
        return false;
    }

    const response = await fetch('http://localhost:3000/auth', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-key': token,
        },
    });

    if (response.status === 200) {
        return true;
    } else {
        return false;
    }
}

export default isLoggedIn;
