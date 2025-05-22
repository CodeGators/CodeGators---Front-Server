export async function getFireData(filters: { estado: string; bioma: string; tipo: string }) {
    const response = await fetch('/api/fires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    });
    if (!response.ok) throw new Error('Erro ao buscar dados');
    const data = await response.json();
    return data;
  }