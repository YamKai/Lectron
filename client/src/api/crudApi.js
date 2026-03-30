export function createCrudApi(baseUrl) {
  const headers = { 'Content-Type': 'application/json' };

  return {
    get: async (id) => {
      const url = id === "all" ? baseUrl : `${baseUrl}/${id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GET request failed: ${res.status}`);
      return res.json();
    },

    create: async (data) => {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`POST request failed: ${res.status}`);
      return res.json();
    },

    upsert: async (data) => {
      const res = await fetch(baseUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`PUT(Upsert) request failed: ${res.status}`);
      return res.json();
    },

    update: async (id, data) => {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`UPDATE request failed: ${res.status}`);
      return res.json();
    },

    delete: async (id) => {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error(`DELETE request failed: ${res.status}`);
      return res.json();
    },
  };
}