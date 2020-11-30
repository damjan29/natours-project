import axios from "axios"

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
    try {
        const url = type === 'password'
            ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
            : 'http://127.0.0.1:3000/api/v1/users/updateMe'


        const res = await axios({
            method: 'PATCH',
            url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
            data
        });
        if (res.data.status === 'success') {
            alert(`${type.toUpperCase()} updated successfuly`)
        }

    } catch (err) {
        console.log(err);
        alert(err.data.message)
    }



};