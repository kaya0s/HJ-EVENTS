export interface Booking {
  id: string;
  clientName: string;
  eventDate: string;
  supplier: string;
  status: "pending" | "approved" | "completed" | "declined";
  contactInfo: string;
}

export interface Supplier {
  id: string;
  name: string;
  serviceType: string;
  contactInfo: string;
  email: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  clientName: string;
  supplier: string;
  status: "pending" | "approved" | "completed";
}

export const mockBookings: Booking[] = [
  {
    id: "1",
    clientName: "Sarah & James Mitchell",
    eventDate: "2025-06-15",
    supplier: "Elegant Events Co.",
    status: "approved",
    contactInfo: "sarah.mitchell@email.com",
  },
  {
    id: "2",
    clientName: "Emily & David Chen",
    eventDate: "2025-07-20",
    supplier: "Dream Weddings Plus",
    status: "pending",
    contactInfo: "emily.chen@email.com",
  },
  {
    id: "3",
    clientName: "Jessica & Michael Brown",
    eventDate: "2025-05-10",
    supplier: "Perfect Day Events",
    status: "completed",
    contactInfo: "jess.brown@email.com",
  },
  {
    id: "4",
    clientName: "Amanda & Robert Wilson",
    eventDate: "2025-08-05",
    supplier: "Elegant Events Co.",
    status: "pending",
    contactInfo: "amanda.wilson@email.com",
  },
  {
    id: "5",
    clientName: "Lauren & Chris Taylor",
    eventDate: "2025-09-12",
    supplier: "Luxury Celebrations",
    status: "approved",
    contactInfo: "lauren.taylor@email.com",
  },
];

export const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Elegant Events Co.",
    serviceType: "Full Service Planning",
    contactInfo: "+1 (555) 123-4567",
    email: "contact@elegantevents.com",
  },
  {
    id: "2",
    name: "Dream Weddings Plus",
    serviceType: "Venue & Catering",
    contactInfo: "+1 (555) 234-5678",
    email: "info@dreamweddings.com",
  },
  {
    id: "3",
    name: "Perfect Day Events",
    serviceType: "Coordination & Decor",
    contactInfo: "+1 (555) 345-6789",
    email: "hello@perfectdayevents.com",
  },
  {
    id: "4",
    name: "Luxury Celebrations",
    serviceType: "Premium Planning",
    contactInfo: "+1 (555) 456-7890",
    email: "contact@luxurycelebrations.com",
  },
];

export const mockCalendarEvents: CalendarEvent[] = mockBookings
  .filter((b): b is Booking & { status: "pending" | "approved" | "completed" } => 
    b.status !== "declined"
  )
  .map(b => ({
    id: b.id,
    date: b.eventDate,
    clientName: b.clientName,
    supplier: b.supplier,
    status: b.status,
  }));
