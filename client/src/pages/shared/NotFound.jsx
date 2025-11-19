import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-base-100 text-base-content transition-colors">
      {/* Placeholder for image */}
      <div className="w-52 sm:w-72 mb-8">
        {/* Replace src below with your image later */}
        <img
          src="https://scontent.fcgy3-2.fna.fbcdn.net/v/t1.15752-9/458997800_529319876708900_3827399370878947883_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeF3PYoa7-L8X9IuGfZ_I4kCJLGn0NKut0UksafQ0q63RaqAZMR-uVbFvNrAd0U1Lvt461Wm4MI05G-9TD4JdsC4&_nc_ohc=ZoYF-QZR4EUQ7kNvwFQv8rf&_nc_oc=AdkQhPdbd6huEojT9Z27Y6qy-F8ly0iHLfEf_HK0SyBnwxBeq0bUUIHyOcsCHKMmXJU&_nc_zt=23&_nc_ht=scontent.fcgy3-2.fna&oh=03_Q7cD3wESF6cbrAFpbXqjbQluuWmy23vrjpuxGGxAloAIyw7ofw&oe=69412142"
          alt="Not Found"
          className="w-full h-auto object-contain rounded-xl shadow-lg bg-base-200"
        />
      </div>
      <h1 className="text-5xl font-bold mb-2 text-primary">404</h1>
      <p className="text-xl mb-6 text-base-content/80">
        Sorry, the page you were looking for was not found.
      </p>
      <Link to="/" className="btn btn-primary btn-wide">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
