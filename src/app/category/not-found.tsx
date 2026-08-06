import Link from "next/link";
import { BiSearch } from "react-icons/bi";

export default function NotFound() {
  return (
<div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
          
          {/* Icon */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
            <BiSearch className="h-12 w-12 text-gray-800" />
          </div>
  
          {/* Title */}
          <h1 className="mt-6 text-3xl font-bold text-gray-800">
            Category Not Found
          </h1>
  
          {/* Description */}
         <p className="mt-3 text-gray-500 leading-6">
            Sorry, we couldn't find the category you're looking for.
        </p>

  
          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 rounded-xl bg-black px-6 py-3 text-white font-medium transition hover:bg-gray-800"
            >
              Go Home
            </Link>

            
          </div>
        </div>
      </div>
  );
}
