export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-auto">
      <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} HJ-EVENTS. All rights reserved.</p>
      </div>
    </footer>
  );
}
