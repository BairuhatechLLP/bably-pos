import API from '../config/api';
import {Store} from '../redux/store/index';

const GET = async (url: any, params: any) => {
  const authToken: any = Store.getState()?.Auth.authToken;
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout - Server not responding'));
    }, 30000); // 30 second timeout

    try {
      console.log('GET Request:', API.BASE_URL + url);

      const response = await fetch(API.BASE_URL + url, {
        method: 'get',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      clearTimeout(timeout);
      console.log('Response Status:', response.status);

      if (!response.ok) {
        console.log('HTTP Error:', response.status, response.statusText);
        reject(new Error(`HTTP Error: ${response.status} ${response.statusText}`));
        return;
      }

      const json = await response.json();
      console.log('Response Data:', json);
      resolve(json);
    } catch (error) {
      clearTimeout(timeout);
      console.log('Fetch Error:', error);
      reject(error);
    }
  });
};

const POST = async (url: any, body: any) => {
  const authToken: any = Store.getState()?.Auth?.authToken;
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout - Server not responding'));
    }, 30000); // 30 second timeout

    try {
      console.log('POST Request:', API.BASE_URL + url);
      console.log('Request Body:', body);

      const response = await fetch(API.BASE_URL + url, {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });

      clearTimeout(timeout);
      console.log('Response Status:', response.status);

      if (!response.ok) {
        console.log('HTTP Error:', response.status, response.statusText);
        reject(new Error(`HTTP Error: ${response.status} ${response.statusText}`));
        return;
      }

      const json = await response.json();
      console.log('Response Data:', json);
      resolve(json);
    } catch (error) {
      clearTimeout(timeout);
      console.log('Fetch Error:', error);
      reject(error);
    }
  });
};

const PUT = async (url: any, body: any, params: any) => {
  const authToken: any = Store.getState()?.Auth.authToken;
  return new Promise(async (resolve, reject) => {
    fetch(API.BASE_URL + url, {
      method: 'put',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    })
      .then(response => response.json())
      .then(json => {
        resolve(json);
      })
      .catch(error => {
        reject(error);
      });
  });
};

const DELETE = async (url: any) => {
  return new Promise(async (resolve, reject) => {
    fetch(API.BASE_URL + url, {
      method: 'delete',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(json => {
        resolve(json);
      })
      .catch(error => {
        reject(error);
      });
  });
};
const COMPRESS_IMAGE = async (file: any) => {
  try {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API.BASE_URL}${API.IMAGE_COMPRESS}`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const jsonResponse: any = await response.json();
        const obj = {
          ...jsonResponse,
          url: jsonResponse.Location,
          status: true,
        };
        return obj;
      }
    } else {
      return {status: false};
    }
  } catch (err) {
    console.log(err);
  }
};
export {DELETE, GET, POST, PUT, COMPRESS_IMAGE};
