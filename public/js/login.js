import axios from 'axios';
// const axios = require('axios')

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            },

        });

        // console.log(res);
        if (res.data.status === 'success') {
            alert('Logged in succesfully!');
            // window.setTimeout(() => {
            // location.assign('/');
            // }, 1500)
        }
    } catch (err) {
        alert(err.response.data.message)
    }
}


export const logut = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout'
        });

        if (res.data.status = 'success') location.reload(true);

    } catch (err) {
        alert('Error logging out! Tty again!');
        showAlert('error', 'Error logging out! Tty again!');
    }
}

