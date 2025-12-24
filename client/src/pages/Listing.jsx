import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import {  FaBath, FaBed, FaChair, FaMapMarkerAlt, FaParking, FaShare } from "react-icons/fa";

const Listing = () => {
  SwiperCore.use([Navigation]);
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchListing = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/listing/get/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load listing");
        }

        if (isMounted) {
          setListing(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load listing");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchListing();
    } else {
      setError("Listing id is missing.");
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2000);
    } catch (err) {
      setShareLinkCopied(true);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-slate-600 animate-spin"
            aria-hidden="true"
          />
          <p className="text-slate-600 text-sm tracking-wide">
            Loading listing...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-3 max-w-4xl mx-auto">
        <p className="text-red-600 text-sm">{error}</p>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="p-3 max-w-4xl mx-auto">
        <p className="text-slate-600 text-center">Listing not found.</p>
      </main>
    );
  }

  const listingTypeLabel = listing.type === "rent" ? "For Rent" : "For Sale";
  const price = listing.offer ? listing.discountedPrice : listing.regularPrice;

  return (
    <main className="min-h-screen w-full p-0">
      {listing && !loading && !error && (
        <div className="w-full relative">
          <Swiper navigation className="w-full">
            {(listing.imageUrls || []).map((url) => (
              <SwiperSlide key={url}>
                <div
                  className="w-full h-[450px] sm:h-[520px] md:h-[600px]"
                  style={{ background: `url(${url}) center/cover no-repeat` }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="fixed top-[13%] right-[3%] z-20 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 hover:bg-slate-200 transition"
              aria-label="Copy link"
            >
              <FaShare className="text-slate-600" />
            </button>
            {shareLinkCopied && (
              <p className="text-sm text-slate-800 bg-white/90 border border-slate-200 shadow-sm px-3 py-1 rounded-md">
                Link copied!
              </p>
            )}
          </div>
                <div className="flex flex-col mx-auto max-w-4xl p-3  gap-4">
               <p className="text-3xl font-semibold">{listing.name} - ${" "} {
                  listing.offer ? listing.discountedPrice.toLocaleString().replace() 
                  : listing.regularPrice.toLocaleString('en-US')}
                  {listing.type === 'rent' && ' / Month'}
               </p>
               <p className="flex items-center mt-6 gap-2 text-slate-600 my-2 text-sm">
                <FaMapMarkerAlt className=" text-green-700" />
                {listing.address}
               </p>
               <div className="flex gap-4 ">
                   <p className="bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                    {listing.type === 'rent' ? "For Rent" : "For Sale"}
                   </p>
                   {listing.offer && (
                    <p className="bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md  ">
                        ${listing.regularPrice - listing.discountedPrice} discount
                    </p>
                   )}
               </div>
                  <p className="text-slate-600"
            > <span className="font-semibold text-black  ">
               Description - {' '}
                </span> 
             {listing.description}</p>
             <ul className=" text-green-900 flex items-center flex-wrap gap-4 sm:gap-6 font-semibold text-sm">
              <li className="flex items-center gap-1 whitespace-nowrap">
                <FaBed className="inline mr-2 text-lg text-green-600" />
                {listing.bedrooms} {listing.bedrooms > 1 ? 'Beds' : 'Bed'}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap">
                <FaBath className="inline mr-2 text-lg text-green-600" />
                {listing.bathrooms} {listing.bathrooms > 1 ? 'Baths' : 'Bath'}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap">
                <FaParking className="inline mr-2 text-lg text-green-600" />
                {listing.parking} {listing.parking > 1 ? 'Parking Spaces' : 'Parking Space'}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap">
                <FaChair className="inline mr-2 text-lg text-green-600" />
                {listing.furnished ? 'Furnished' : 'Unfurnished'}
              </li>
              
             </ul>
            </div>
         
           </div>
      )}
    </main>
  );
};

export default Listing;
