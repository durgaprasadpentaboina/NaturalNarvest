import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import { AdminRoute, ProtectedRoute } from './components/RouteGuards';
import { PageLoader } from './components/Spinner';
import Home from './pages/Home';

const Products = lazy(() => import('./pages/Products.jsx'));;
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));;
const Categories = lazy(() => import('./pages/Categories.jsx'));;
const CategoryPage = lazy(() => import('./pages/CategoryPage.jsx'));;
const Search = lazy(() => import('./pages/Search.jsx'));;
const Cart = lazy(() => import('./pages/Cart.jsx'));;
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'));;
const Checkout = lazy(() => import('./pages/Checkout.jsx'));;
const Login = lazy(() => import('./pages/Login.jsx'));;
const Register = lazy(() => import('./pages/Register.jsx'));;
const Profile = lazy(() => import('./pages/Profile.jsx'));;
const Orders = lazy(() => import('./pages/Orders.jsx'));;
const OrderDetail = lazy(() => import('./pages/OrderDetail.jsx'));;
const About = lazy(() => import('./pages/About.jsx'));;
const Contact = lazy(() => import('./pages/Contact.jsx'));;
const Faq = lazy(() => import('./pages/Faq.jsx'));;
const NotFound = lazy(() => import('./pages/NotFound.jsx'));;
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));;
const AdminProducts = lazy(() => import('./pages/admin/Products.jsx'));;
const AdminProductForm = lazy(() => import('./pages/admin/ProductForm.jsx'));;
const AdminOrders = lazy(() => import('./pages/admin/Orders.jsx'));;
const AdminCustomers = lazy(() => import('./pages/admin/Customers.jsx'));;
const AdminCategories = lazy(() => import('./pages/admin/Categories.jsx'));;
const AdminReviews = lazy(() => import('./pages/admin/Reviews.jsx'));;
const AdminMessages = lazy(() => import('./pages/admin/Messages.jsx'));;

const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="categories" element={<Categories />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="search" element={<Search />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="checkout" element={guard(<Checkout />)} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={guard(<Profile />)} />
          <Route path="orders" element={guard(<Orders />)} />
          <Route path="orders/:id" element={guard(<OrderDetail />)} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<Faq />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/add" element={<AdminProductForm />} />
          <Route path="products/edit/:id" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
