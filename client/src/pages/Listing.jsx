import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";

const Listing = () => {
  SwiperCore.use([Navigation]);
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <div className="w-full">
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
        </div>
      )}
    </main>
  );
};

export default Listing;
