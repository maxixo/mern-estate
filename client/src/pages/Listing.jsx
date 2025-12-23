// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";

// const Listing = () => {
//   const { id } = useParams();
//   const [listing, setListing] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     let isMounted = true;

//     const fetchListing = async () => {
//       setLoading(true);
//       setError("");

//       try {
//         const response = await fetch(`/api/listing/${id}`);
//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.message || "Failed to load listing");
//         }

//         if (isMounted) {
//           setListing(data);
//         }
//       } catch (err) {
//         if (isMounted) {
//           setError(err.message || "Failed to load listing");
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     if (id) {
//       fetchListing();
//     } else {
//       setError("Listing id is missing.");
//       setLoading(false);
//     }

//     return () => {
//       isMounted = false;
//     };
//   }, [id]);

//   if (loading) {
//     return (
//       <main className="p-3 max-w-4xl mx-auto">
//         <p className="text-slate-600">Loading listing...</p>
//       </main>
//     );
//   }

//   if (error) {
//     return (
//       <main className="p-3 max-w-4xl mx-auto">
//         <p className="text-red-600 text-sm">{error}</p>
//       </main>
//     );
//   }

//   if (!listing) {
//     return (
//       <main className="p-3 max-w-4xl mx-auto">
//         <p className="text-slate-600">Listing not found.</p>
//       </main>
//     );
//   }

//   const listingTypeLabel = listing.type === "rent" ? "For Rent" : "For Sale";
//   const price = listing.offer ? listing.discountedPrice : listing.regularPrice;

//   return (
//     <main className="p-3 max-w-4xl mx-auto">
//       <div className="flex flex-col gap-4">
//         <div className="flex flex-col gap-1">
//           <h1 className="text-3xl font-semibold">{listing.name}</h1>
//           <p className="text-slate-600">{listing.address}</p>
//         </div>

//         {Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0 ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             {listing.imageUrls.map((url, index) => (
//               <img
//                 key={`${url}-${index}`}
//                 src={url}
//                 alt={`${listing.name}-${index + 1}`}
//                 className="w-full h-64 object-cover rounded-lg"
//               />
//             ))}
//           </div>
//         ) : (
//           <p className="text-slate-500 text-sm">No images available.</p>
//         )}

//         <div className="flex flex-wrap gap-2 text-sm">
//           <span className="px-2 py-1 bg-slate-100 rounded">{listingTypeLabel}</span>
//           <span className="px-2 py-1 bg-slate-100 rounded">
//             {listing.bedrooms} Beds
//           </span>
//           <span className="px-2 py-1 bg-slate-100 rounded">
//             {listing.bathrooms} Baths
//           </span>
//           {listing.parking && (
//             <span className="px-2 py-1 bg-slate-100 rounded">Parking</span>
//           )}
//           {listing.furnished && (
//             <span className="px-2 py-1 bg-slate-100 rounded">Furnished</span>
//           )}
//           {listing.offer && (
//             <span className="px-2 py-1 bg-slate-100 rounded">Offer</span>
//           )}
//         </div>

//         <div className="flex flex-col gap-1">
//           <p className="text-xl font-semibold">${price}</p>
//           {listing.offer && (
//             <p className="text-sm text-slate-500 line-through">
//               ${listing.regularPrice}
//             </p>
//           )}
//         </div>

//         <div className="flex flex-col gap-2">
//           <h2 className="text-lg font-semibold">Description</h2>
//           <p className="text-slate-700">{listing.description}</p>
//         </div>
//       </div>
//     </main>
//   );
// };

// export default Listing;
