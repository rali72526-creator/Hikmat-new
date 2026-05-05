export const getTreatment = async (age: string, city: string, condition: string) => {
  const username = localStorage.getItem('admin_username') || '';
  const password = localStorage.getItem('admin_password') || '';
  
  const response = await fetch('/api/treatment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-username': username,
      'x-admin-password': password
    },
    body: JSON.stringify({ age, city, condition })
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    throw new Error('Failed to fetch treatment');
  }

  const data = await response.json();
  return data.text;
};

export const analyzeRemedy = async (remedy: string) => {
  const username = localStorage.getItem('admin_username') || '';
  const password = localStorage.getItem('admin_password') || '';
  
  const response = await fetch('/api/remedy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-username': username,
      'x-admin-password': password
    },
    body: JSON.stringify({ remedy })
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    throw new Error('Failed to analyze remedy');
  }

  const data = await response.json();
  return data.text;
};
