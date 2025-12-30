import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";


export default function ListingItem({ listing }) {
  if (!listing) return null;

  const imageUrl = listing.imageUrls && listing.imageUrls.length > 0 ? listing.imageUrls[0] : '';
  
  return (
    <div className="bg-white shadow-md hover:shadow-lg 
    transition-shadow overflow-hidden  w-full sm:w-[330px] lg:w-[300px] rounded-lg">
      
    <Link to={`/listing/${listing._id}`}>
    {imageUrl && <img src={imageUrl} className="h-80 sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300 "     alt="listing" />}
     <div className="p-3 flex flex-col gap-2 w-full">
       <p className="font-semibold text-lg truncate">{listing.name || 'No name'}</p>
       
       <div className="flex items-center gap-1">
         <MdLocationOn className="h-4 w-4 text-green-700"/>
         <p className="text-sm text-gray-600 truncate w-full">{listing.address || 'No address'}</p>
       </div>
       
       <p className="text-sm text-gray-600 line-clamp-2">{listing.description || 'No description'}</p>
       
       <p className="text-slate-500 mt-2 font-semibold">
         {listing.offer 
           ? (listing.discountPrice?.toLocaleString('en-US') || 'N/A') 
           : (listing.regularPrice?.toLocaleString('en-US') || 'N/A')}
         {listing.type === 'rent' && '/month'}
       </p>
       
       <div className="text-slate-700 flex gap-4">
         <div className="font-bold text-xs">
           {listing.bedrooms > 1 ? 
             `${listing.bedrooms} beds` : `${listing.bedroom || 1} bed`}
         </div>
         <div className="font-bold text-xs">
           {listing.bathrooms > 1 ? 
             `${listing.bathrooms} baths` : `${listing.bathroom || 1} bath`}
         </div>
       </div>
     </div>
   
    </Link>
    
    
    </div>
  );
}
