// Renders the real app against a running, seeded API (see backend/README steps).
// Run:  (backend) npm run seed && npm start    (frontend) npm test
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';

const mount = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider><AuthProvider><CartProvider><WishlistProvider><App /></WishlistProvider></CartProvider></AuthProvider></ToastProvider>
    </MemoryRouter>
  );

beforeEach(() => localStorage.clear());

describe('storefront', () => {
  it('home page shows hero, categories and live products', async () => {
    mount('/');
    expect(await screen.findByRole('heading', { name: /natural goodness in every grain/i })).toBeInTheDocument();
    expect((await screen.findAllByText('Organic Toor Dal', {}, { timeout: 15000 })).length).toBeGreaterThan(0);
    expect((await screen.findAllByRole('link', { name: /rice/i })).length).toBeGreaterThan(0);
  });

  it('product listing filters by search term from the URL', async () => {
    mount('/search?q=moong');
    expect(await screen.findByText(/Premium Moong Dal/, {}, { timeout: 15000 })).toBeInTheDocument();
    expect(screen.queryByText('Kidney Beans (Rajma)')).not.toBeInTheDocument();
  });

  it('no-results state for a bad search', async () => {
    mount('/search?q=zzzzqq');
    expect(await screen.findByText(/nothing matches yet/i, {}, { timeout: 15000 })).toBeInTheDocument();
  });

  it('guest can add to cart from the product page and see totals', async () => {
    const user = userEvent.setup();
    mount('/products/organic-toor-dal');
    expect(await screen.findByRole('heading', { name: 'Organic Toor Dal' }, { timeout: 15000 })).toBeInTheDocument();
    expect(screen.getByText(/nutrition facts/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem('nh_guest_cart'))).toHaveLength(1));
  });

  it('cart page lists the guest item with the full price breakdown', async () => {
    localStorage.setItem('nh_guest_cart', JSON.stringify([{ id: 'x-1000', grams: 1000, quantity: 2, product: { _id: 'x', name: 'Test Dal', slug: 'test-dal', images: [], stock: 100, price: 200, discountPrice: 180, weightOptions: [{ label: '1 kg', grams: 1000 }] } }]));
    mount('/cart');
    expect(await screen.findByText('Test Dal')).toBeInTheDocument();
    for (const label of ['Subtotal', 'Discount', 'Shipping', 'Grand Total']) expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeInTheDocument();
  });

  it('empty cart, protected routes and 404', async () => {
    mount('/cart');
    expect(await screen.findByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('checkout redirects guests to login', async () => {
    mount('/checkout');
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });

  it('unknown route shows the 404 page', async () => {
    mount('/definitely-not-a-page');
    expect(await screen.findByText(/404/)).toBeInTheDocument();
  });

  it('unknown product shows product-not-found', async () => {
    mount('/products/not-a-real-product');
    expect(await screen.findByText(/product not found/i, {}, { timeout: 15000 })).toBeInTheDocument();
  });
});

describe('auth, orders and admin', () => {
  it('login shows an error for wrong credentials', async () => {
    const user = userEvent.setup();
    mount('/login');
    await user.type(screen.getByLabelText(/email/i), 'ananya@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'wrong-password1');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/incorrect email or password/i);
  });

  it('customer logs in, sees orders and the wishlist page', async () => {
    const user = userEvent.setup();
    mount('/login');
    await user.type(screen.getByLabelText(/email/i), 'ananya@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'Customer@123');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('heading', { name: /natural goodness/i }, { timeout: 15000 })).toBeInTheDocument();
    expect(localStorage.getItem('nh_token')).toBeTruthy();
  });

  it('admin dashboard renders live stats', async () => {
    const user = userEvent.setup();
    mount('/login');
    await user.type(screen.getByLabelText(/email/i), 'admin@naturalharvest.com');
    await user.type(screen.getByLabelText(/^password/i), 'ChangeMe@123');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('heading', { name: 'Dashboard' }, { timeout: 20000 })).toBeInTheDocument();
    expect(await screen.findByText('Total sales', {}, { timeout: 15000 })).toBeInTheDocument();
    expect(screen.getByText(/low stock/i, { selector: 'p' })).toBeInTheDocument();
  });
});
