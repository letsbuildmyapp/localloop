import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { RequireAuth } from "./components/RequireAuth";
import { Tutorial } from "./components/Tutorial";

import Home from "./pages/Home";
import Browse from "./pages/Browse";
import ListingDetail from "./pages/ListingDetail";
import HowItWorks from "./pages/HowItWorks";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import SellerHub from "./pages/SellerHub";
import NewListing from "./pages/NewListing";
import EditListing from "./pages/EditListing";
import BookingDetail from "./pages/BookingDetail";
import Messages from "./pages/Messages";
import Conversation from "./pages/Conversation";
import Admin from "./pages/Admin";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import NotFound from "./pages/NotFound";
import ServerError from "./pages/ServerError";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/bookings/:id" element={<RequireAuth><BookingDetail /></RequireAuth>} />
          <Route path="/checkout/success" element={<RequireAuth><CheckoutSuccess /></RequireAuth>} />
          <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
          <Route path="/messages/:id" element={<RequireAuth><Conversation /></RequireAuth>} />

          <Route path="/seller" element={<RequireAuth role="seller"><SellerHub /></RequireAuth>} />
          <Route path="/seller/new" element={<RequireAuth role="seller"><NewListing /></RequireAuth>} />
          <Route path="/seller/edit/:id" element={<RequireAuth role="seller"><EditListing /></RequireAuth>} />

          <Route path="/admin" element={<RequireAuth role="admin"><Admin /></RequireAuth>} />

          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Tutorial />
    </div>
  );
}
