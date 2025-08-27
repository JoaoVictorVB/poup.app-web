import type { Subscription } from '../types';

/**
 * Dados de exemplo para popular a aplicação inicialmente.
 */
export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { id: 1, name: 'Google One', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_One_logo.svg/1200px-Google_One_logo.svg.png', category: 'Serviços em Nuvem', cost: 12.00, currency: 'EUR', paymentFrequency: 'Mensal', nextPayment: '2025-09-22', paymentMethod: 'PayPal', paidBy: 'John Doe', url: 'https://one.google.com/', notes: '' },
  { id: 2, name: 'HBO Max', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/HBO_Max_Logo.svg/1200px-HBO_Max_Logo.svg.png', category: 'Entretenimento', cost: 14.00, currency: 'EUR', paymentFrequency: 'Mensal', nextPayment: '2025-09-24', paymentMethod: 'PayPal', paidBy: 'John Doe', url: 'https://www.hbomax.com/', notes: '' },
  { id: 3, name: 'iCloud', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Apple_iCloud_logo.svg/1200px-Apple_iCloud_logo.svg.png', category: 'Serviços em Nuvem', cost: 10.00, currency: 'EUR', paymentFrequency: 'Mensal', nextPayment: '2025-09-29', paymentMethod: 'Apple Pay', paidBy: 'John Doe', url: 'https://www.apple.com/icloud/', notes: '' },
  { id: 4, name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1200px-Netflix_2015_logo.svg.png', category: 'Entretenimento', cost: 14.99, currency: 'EUR', paymentFrequency: 'Mensal', nextPayment: '2025-09-29', paymentMethod: 'Cartão de Crédito', paidBy: 'Jane Doe', url: 'https://www.netflix.com/', notes: 'Plano Premium' },
  { id: 5, name: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/1982px-Spotify_icon.svg.png', category: 'Entretenimento', cost: 17.99, currency: 'EUR', paymentFrequency: 'Mensal', nextPayment: '2025-10-01', paymentMethod: 'PayPal', paidBy: 'Jane Doe', url: 'https://www.spotify.com/', notes: '' },
  { id: 6, name: 'Proton', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Proton_logo.svg/1200px-Proton_logo.svg.png', category: 'Produtividade', cost: 180.00, currency: 'EUR', paymentFrequency: '2 anos', nextPayment: '2025-12-21', paymentMethod: 'Cartão de Crédito', paidBy: 'John Doe', url: 'https://proton.me/', notes: '' },
];
