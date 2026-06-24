import API from '../config/api';
import {Store} from '../redux/store/index';

// Timeout helper function
const fetchWithTimeout = (url: string, options: any, timeout = 30000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout - Server not responding')), timeout)
    )
  ]);
};

const GET = async (url: string) => {
  const authToken: any = Store.getState()?.Auth?.authToken;
  const fullUrl = API.BASE_URL + url;

  return new Promise((resolve, reject) =>
    fetchWithTimeout(fullUrl, {
      method: 'get',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }, 30000) // 30 second timeout
      .then((response: any) => {
        return response.json();
      })
      .then(json => {
        resolve(json);
      })
      .catch(err => {
        console.error(`❌ [API GET] Error for ${url}:`, err.message);
        reject(err);
      }),
  );
};

const POST = async (url: any, body: any) => {
  const authToken: any = Store.getState()?.Auth?.authToken;
  const fullUrl = API.BASE_URL + url;

  return new Promise((resolve, reject) => {
    fetchWithTimeout(fullUrl, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    }, 30000) // 30 second timeout
      .then(async (response: any) => {
        const json = await response.json();
        if (!response.ok) {
          const error = new Error(json.message || 'Request failed');
          (error as any).status = response.status;
          (error as any).data = json;
          reject(error);
          return;
        }
        resolve(json);
      })
      .catch(error => {
        console.error(`❌ [API POST] Error for ${url}:`, error.message);
        reject(error);
      });
  });
};

const PUT = async (url: any, body: any) => {
  const authToken: any = Store.getState()?.Auth?.authToken;
  const fullUrl = API.BASE_URL + url;

  return new Promise((resolve, reject) => {
    fetchWithTimeout(fullUrl, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    }, 30000) // 30 second timeout
      .then(async (response: any) => {
        const json = await response.json();
        if (!response.ok) {
          const error = new Error(json.message || 'Request failed');
          (error as any).status = response.status;
          (error as any).data = json;
          reject(error);
          return;
        }
        resolve(json);
      })
      .catch(error => {
        console.error(`❌ [API PUT] Error for ${url}:`, error.message);
        reject(error);
      });
  });
};

const DELETE = async (url: string) => {
  try {
    const authToken: any = Store.getState()?.Auth?.authToken;
    const fullUrl = API.BASE_URL + url;

    const response: any = await fetchWithTimeout(fullUrl, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    }, 30000); // 30 second timeout

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || 'Something went wrong');
      (error as any).status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error: any) {
    console.error(`❌ [API DELETE] Error for ${url}:`, error.message);
    throw error;
  }
};

export {GET, POST, PUT, DELETE};
