import axios from 'axios';
import { showAlert } from './alert';

export const updateData = async (name, email) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
      data: {
        name,
        email,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Account successfully updated');
    }

    console.log(res);
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
