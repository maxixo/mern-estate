import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import {Navigation} from 'swiper/modules'
import SwiperCore from 'swiper'
import "swiper/css/bundle";
import ListingItem from "../components/ListingItem";

const Home = () => {

  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [imageUploadError, setImageUploadError] = useState(null);
console.log(offerListings);


  SwiperCore.use([Navigation])
  console.log(saleListings);
 
  useEffect(() =>  {
   const fetchOfferListings = async () => {
      try {
        const res = await fetch("/api/listing/get?offer=true&limit=4");
        const data = await res.json();
        setOfferListings(data);
        fetchRentListings();
      } catch (error) {
        console.log(error)
      } 
   }

   const fetchRentListings = async () => {
       try {
         const res = await fetch("/api/listing/get?type=rent&limit=4");
        const data = await res.json();
        setRentListings(data);
        fetchSaleListings();
        
       } catch (error) {
         console.log(error)
       }
   }
  const fetchSaleListings = async () => {
      try {
     const res = await fetch("/api/listing/get?type=sale&limit=4");
        const data = await res.json();
        setSaleListings(data);
      } catch (error) {
      console.log(error)
      }
      
  }



   fetchOfferListings();


  }, []);

  return (
    <main>
      {/* {top} */}

      <div className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto">
        <h1 className="text-slate-700 font-bold text-3xl lg:text-6xl
        ">Find your next <span className="text-slate-500">perfect</span> 
        <br/>
        place with ease</h1>
        <div className=" text-gray-400 text-xs sm:text-sm">
         Sahand Estate is the 
         best place to find your next place to live
         <br/>
         We have a wide range of properties to choose from
        </div>
        <Link className="text-xs sm:text-sm text-blue-800" to={"/search"}>
         Lets get started

        </Link>

      </div>


      {/* {swiper} */}
       {<Swiper navigation>
        {
        offerListings && offerListings.length > 0
          && offerListings.map((listing) => (
            <SwiperSlide >
              <div className="h-[500px]" 
              style={{background:`url(${listing.imageUrls[0]}) center no-repeat`,
               backgroundSize:"cover" }}  key={listing._id}>

              </div>

            </SwiperSlide>
          )

          )}
      
       </Swiper>
}

      {/* {listing results for offer, sale and rent} */}

      <div className="max-w-7xl mx-auto p-3  flex flex-col gap-5 my-10">
        {
          offerListings && offerListings.length > 0 && (
            <div className="">
              <div className="flex items-center justify-between my-3">
                <h2 className="text-2xl font-semibold text-slate-600">Recent Offers</h2>
                <Link className="text-sm text-blue-800 hover:underline" to={'/search?offer=true'}>
                  Show more offers
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                {offerListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          )
        }
        {
          rentListings && rentListings.length > 0 && (
            <div className="">
              <div className="flex items-center justify-between my-3">
                <h2 className="text-2xl font-semibold text-slate-600">Rent Offers</h2>
                <Link className="text-sm text-blue-800 hover:underline" to={'/search?rent=true'}>
                  Show rent listings
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                {rentListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          )
        }
        {
          saleListings && saleListings.length > 0 && (
            <div className="">
              <div className="flex items-center justify-between my-3">
                <h2 className="text-2xl font-semibold text-slate-600">Recent places for sale</h2>
                <Link className="text-sm text-blue-800 hover:underline" to={'/search?sale=true'}>
                  Show sale offers
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                {saleListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          )
        }
      </div>
    </main>
  );
};

export default Home;