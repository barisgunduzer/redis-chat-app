import axios from 'axios';
axios.defaults.withCredentials = true;

const BASE_URL = '';

export const MESSAGES_TO_LOAD = 15;

const url = (x) => `${BASE_URL}${x}`;

/** Checks if there's an existing session. */
export const getMe = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const x_1 = await axios.get(url('/users/me'), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return x_1.data;
  } catch (_) {
    return null;
  }
};

/** Handle user log in */
export const login = async (username, password) => {
  try {
    const x_1 = await axios.post(url('/users/login'), {
      username,
      password,
    });
    localStorage.setItem('access_token', x_1.data.token);
    return x_1.data;
  } catch (e) {
    throw new Error(e.response && e.response.data && e.response.data.message);
  }
};

export const logOut = () => {
  const token = localStorage.getItem('access_token');
  localStorage.removeItem('access_token');
  return axios.post(
    url('/users/logout'),
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

/**
 * Load messages
 *
 * @param {string} id room id
 * @param {number} offset
 * @param {number} size
 */
export const getMessages = async (id, offset = 0, size = MESSAGES_TO_LOAD) => {
  const token = localStorage.getItem('access_token');
  return axios
    .get(url(`/rooms/${id}/messages`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        offset,
        size,
      },
    })
    .then((x) => x.data.reverse());
};

/**
 * @returns {Promise<{ name: string, id: string, messages: Array<import('./state').Message> }>}
 */
export const getPreloadedRoom = async () => {
  const token = localStorage.getItem('access_token');
  return axios
    .get(url(`/rooms/0/preload`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((x) => x.data);
};

/**
 * Fetch users by requested ids
 * @param {Array<number | string>} ids
 */
export const getUsers = async (ids) => {
  const token = localStorage.getItem('access_token');
  console.log(token);
  const x_1 = await axios.get(url(`/users`), {
    params: { ids },
    headers: { Authorization: `Bearer ${token}` },
  });
  return x_1.data;
};

/** Fetch users which are online */
export const getOnlineUsers = async () => {
  const token = localStorage.getItem('access_token');
  const x_1 = await axios.get(url(`/users/0/online`), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return x_1.data;
};

/** This one is called on a private messages room created. */
export const addRoom = async (user1, user2) => {
  const token = localStorage.getItem('access_token');
  return axios
    .post(
      url(`/rooms`),
      { user1, user2 },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    .then((x) => x.data);
};

/**
 * @returns {Promise<Array<{ names: string[]; id: string }>>}
 */
export const getRooms = async (userId) => {
  const token = localStorage.getItem('access_token');
  const rooms = axios
    .get(url(`/rooms/${userId}`), {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((x) => x.data);
  return rooms;
};
