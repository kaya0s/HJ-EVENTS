import { ClientNavBar } from '@/components/layout/client/ClientNavBar';


export const ClientHomePage = () => {
  return (
    <>
      <ClientNavBar />
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6">Welcome to HJ Events</h1>
        <p className="text-lg mb-8">Your perfect event starts here</p>
        {/* Hero section and featured packages will be added here */}
      </div>
    </>
  );
};