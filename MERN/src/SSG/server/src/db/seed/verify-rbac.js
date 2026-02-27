import axios from 'axios';
import fs from 'fs';

const verify = async () => {
  try {
    const api = axios.create({ baseURL: 'http://localhost:5000/api', withCredentials: true });

    console.log("1. Logging in as Admin...");
    const loginRes = await api.post('/auth/login', { email: 'admin@localhost.com', password: 'admin123@', rememberMe: true });

    // Extract Access Token from Response Body and Cookie from header
    const token = loginRes.data.data.accessToken;
    const cookies = loginRes.headers['set-cookie'];
    if (cookies) {
      api.defaults.headers.Cookie = cookies.join('; ');
    }
    api.defaults.headers.Authorization = `Bearer ${token}`;

    console.log("Login Success! Token obtained.");

    console.log("\n2. Testing Super Admin RBAC (Get Roles)...");
    const rolesRes = await api.get('/roles');
    console.log("Success! Roles fetched:", rolesRes.data.data.roles.length);

    console.log("\n3. Testing Super Admin RBAC (Get Users)...");
    const usersRes = await api.get('/users');
    console.log("Success! Users fetched:", usersRes.data.data.docs.length);

    console.log("\nSuper Admin Verification PASSED!");
  } catch (err) {
    if (err.response) {
      console.error("Verification Failed:", err.response?.status, err.response?.data);
    } else {
      console.error("Request Failed:", err);
    }
  }
};

verify();
