export const getToken = () => localStorage.getItem("token");

export const fetchAPI = async (url, method = "GET", body = null) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:8000/api${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: body ? JSON.stringify(body) : null
  });

  if (!res.ok) {
    const err = await res.json();
    err.status = res.status;
    throw err;
  }

  return res.json();
};