import ClientLayout from "../layouts/ClientLayout";
import ClientHome from "../pages/client/Home";
import Packages from "../pages/client/Packages";
import BookingForm from "../pages/client/BookingForm";
import MyBookings from "../pages/client/MyBookings";
import Feedback from "../pages/client/Feedback";

export const clientRoutes = [
  {
    path: "/",
    element: <ClientLayout />,
    children: [
      { index: true, element: <ClientHome /> },
      { path: "packages", element: <Packages /> },
      { path: "book", element: <BookingForm /> },
      { path: "my-bookings", element: <MyBookings /> },
      { path: "feedback", element: <Feedback /> },
    ],
  },
];
