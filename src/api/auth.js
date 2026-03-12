// src/api/auth.js
export const loginUser = async (username, password) => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const text = await response.text(); // your backend returns "Success" or "Invalid username or password"
    return text;
  } catch (err) {
    console.error(err);
    return 'Error connecting to server';
  }
};

export const registerUser = async (username, password) => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const text = await response.text(); // "Success" or "Username already exists"
    return text;
  } catch (err) {
    console.error(err);
    return 'Error connecting to server';
  }
};