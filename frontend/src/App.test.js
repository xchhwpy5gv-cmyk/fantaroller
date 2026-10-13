import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

const atleta2027 = {
  id: 12,
  name: 'Atleta Test',
  categoria: 'Allievi Maschi',
  categoria_2027: 'AL1',
  valutazione: 83.5,
  prezzo: 47,
  visibile: 1,
};
const atleta2027Secondo = {
  id: 13,
  name: 'Secondo Atleta',
  categoria: 'Allievi Maschi',
  categoria_2027: 'AL2',
  valutazione: 71,
  prezzo: 19,
  visibile: 1,
};

function risposta(data, ok = true) {
  return Promise.resolve({ ok, json: () => Promise.resolve(data) });
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('token', 'token-test');
  global.fetch = jest.fn((url) => {
    const path = String(url);
    if (path.endsWith('/me/')) return risposta({ username: 'tester', is_admin: 0 });
    if (path.endsWith('/league/mie-leghe')) {
      return risposta([{ id: 3, nome: 'Lega Test', modalita: 'listone', atleti_per_categoria: 2 }]);
    }
    if (path.endsWith('/athletes/')) return risposta([atleta2027, atleta2027Secondo]);
    if (path.includes('/atleti/piu-acquistati') || path.includes('/atleti/plusvalenze')) return risposta([]);
    if (path.includes('/squadra/?league_id=')) return risposta({ nome: 'Squadra Test', budget: 200, atleti: [] });
    if (path.includes('/league/classifica')) return risposta([]);
    return risposta({});
  });
});

afterEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
});

test('shows the FantaRoller login when there is no saved session', () => {
  localStorage.clear();
  render(<App />);
  expect(screen.getByText('Fantasy Pattinaggio Corsa')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Entra' })).toBeInTheDocument();
});

test('shows the 2027 market category, rating and price', async () => {
  render(<App />);
  await waitFor(() => expect(screen.getByText('Lega Test')).toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: 'Apri il menu' }));
  fireEvent.click(screen.getByText('Mercato', { exact: true }));
  await screen.findByText(/Mercato Atleti/);

  await screen.findByRole('option', { name: 'Allievi Maschi' });
  fireEvent.change(screen.getByDisplayValue('Tutte le categorie'), {
    target: { value: 'Allievi Maschi' },
  });
  const categoryLabels = await screen.findAllByText('Allievi Maschi');
  fireEvent.click(categoryLabels[categoryLabels.length - 1]);

  expect((await screen.findAllByText('83.5/100'))).toHaveLength(2);
  expect(screen.getAllByText('Allievi Maschi · AL1')).toHaveLength(2);
  expect(screen.getByText('47cr')).toBeInTheDocument();
});

test('mobile market cards keep filters, price ordering, statistics and purchase available', async () => {
  const { container } = render(<App />);
  await screen.findByText('Lega Test');
  fireEvent.click(screen.getByRole('button', { name: 'Apri il menu' }));
  fireEvent.click(screen.getByText('Mercato', { exact: true }));
  await screen.findByText(/Mercato Atleti/);

  fireEvent.change(screen.getByDisplayValue('Tutte le categorie'), {
    target: { value: 'Allievi Maschi' },
  });
  fireEvent.change(screen.getByDisplayValue('Prezzo'), { target: { value: 'basso' } });
  fireEvent.click((await screen.findAllByText('Allievi Maschi')).slice(-1)[0]);

  const cards = container.querySelectorAll('.market-mobile-athlete');
  expect(cards).toHaveLength(2);
  expect(cards[0]).toHaveTextContent('Secondo Atleta');
  expect(cards[0]).toHaveTextContent('71.0/100');
  expect(cards[0]).toHaveTextContent('19 crediti');
  expect(cards[1]).toHaveTextContent('Atleta Test');
  expect(cards[1].querySelector('[aria-label="Apri statistiche di Atleta Test"]')).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText('Cerca atleta...'), { target: { value: 'Secondo' } });
  expect(container.querySelectorAll('.market-mobile-athlete')).toHaveLength(1);
  fireEvent.click(container.querySelector('.market-mobile-athlete .market-mobile-buy'));
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/squadra/acquista/13?league_id=3'),
    expect.objectContaining({ method: 'POST' }),
  ));
});
