import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
const Search = () => {

  const navigate = useNavigate()
  const location = useLocation()

  const [sidebardata , setSidebardata] = useState({
         searchTerm:"",
         type:"all",
         sale:false,
         parking:false,
         furnished:false,
         offer:false,
         sort:'createdAt',
         order:"desc",
  })

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const searchTermFromUrl = urlParams.get('searchTerm')
    const typeFromUrl = urlParams.get('type')
    const parkingFromUrl = urlParams.get('parking')
    const furnishedFromUrl = urlParams.get('furnished')
    const offerFromUrl = urlParams.get('offer')
    const sortFromUrl = urlParams.get('sort')
    const orderFromUrl = urlParams.get('order')

    setSidebardata((prev) => ({
      ...prev,
      searchTerm: searchTermFromUrl ?? prev.searchTerm,
      type: typeFromUrl ?? prev.type,
      parking: parkingFromUrl === null ? prev.parking : parkingFromUrl === 'true',
      furnished: furnishedFromUrl === null ? prev.furnished : furnishedFromUrl === 'true',
      offer: offerFromUrl === null ? prev.offer : offerFromUrl === 'true',
      sort: sortFromUrl ?? prev.sort,
      order: orderFromUrl ?? prev.order,
    }))

    const fetchlisting = async () => {
         setLoading(true)
         const searchQuery = urlParams.toString();
         const res = await fetch(`/api/listing/get?${searchQuery}`)
         const data = await res.json();
         setListings(data.listings);
         setLoading(false);
    }
    
    fetchlisting();


  }, [location.search])


 const handleChange = (e) => {
  const { id, value, checked } = e.target

  if (id === "all" || id === "rent" || id === "sale") {
    setSidebardata((prev) => ({ ...prev, type: id }))
  }

  if (id === "searchTerm") {
    setSidebardata((prev) => ({ ...prev, searchTerm: value }))

    const urlParams = new URLSearchParams(location.search)
    urlParams.set('searchTerm', value)
    navigate({ pathname: '/search', search: `?${urlParams.toString()}` }, { replace: true })
  }

  if (id === "parking" || id === "furnished" || id === "offer") {
    setSidebardata((prev) => ({ ...prev, [id]: checked }))
  }

  if (id === "sort_order") {
    const [sort = "createdAt", order = "desc"] = value.split('_')
    setSidebardata((prev) => ({ ...prev, sort, order }))
  }
}

  const handleSubmit = (e) => {
   e.preventDefault();
   const trimmedSearchTerm = sidebardata.searchTerm.trim()
   setSidebardata((prev) => ({ ...prev, searchTerm: trimmedSearchTerm }))
   const urlParams = new URLSearchParams()
   urlParams.set('searchTerm', trimmedSearchTerm)
   urlParams.set('type', sidebardata.type)
   urlParams.set('parking', sidebardata.parking)
   urlParams.set('furnished', sidebardata.furnished)
   urlParams.set('offer', sidebardata.offer)
   urlParams.set('sort', sidebardata.sort)
  urlParams.set('order', sidebardata.order)
   
  const searchQuery = urlParams.toString()
  navigate({ pathname: '/search', search: `?${searchQuery}` })
 }

  return (
    <div className='flex flex-col md:flex-row'>
     <div className='p-7 border-b-2 md:border-r-2 md:min-h-screen'>
         <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
          <div className='flex items-center gap-2 '>

            <label className='whitespace-nowrap font-semibold' >Search Term</label>
            <input type="text"
            id="searchTerm"
            placeholder='Search...'
            onChange={handleChange}
            value={sidebardata.searchTerm}
            className='border  rounded-lg p-3 w-full'     
            />    
         </div>
           <div className='flex gap-2 flex-wrap items-center'>
            <label className='font-semibold'>Type</label>
            <div className='flex gap-2 '>
                <input type="checkbox" 
                onChange={handleChange}
                 id="all"
                 checked={sidebardata.type === "all"}
                 className='w-5' />
                <span>Rent & sale </span>
              
            </div>
            <div className='flex gap-2 '>
                <input type="checkbox" checked={sidebardata.type === "rent"} id="rent" onChange={handleChange} className='w-5' />
                <span>Rent </span>
            </div>
            <div className='flex gap-2 '>
                <input type="checkbox" 
                checked={sidebardata.type === "sale"}
                id="sale" className='w-5' 
                onChange={handleChange}
                />
                <span>Sale</span>
            </div>
            <div className='flex gap-2 '>
                <input type="checkbox"
                checked={sidebardata.offer}
                onChange={handleChange}
                id="offer" className='w-5' />
                <span>Offer </span>
            </div>
           </div>
           <div className='flex gap-2 flex-wrap items-center'>
            <label className='font-semibold'>Amenities</label>
            <div className='flex gap-2 '>
                <input type="checkbox"
                onChange={handleChange}
                checked={sidebardata.parking}
                id="parking" className='w-5' />
                <span>Parking </span>
            </div>
             <div className='flex gap-2 '>
                 <input type="checkbox" 
               checked={sidebardata.furnished}
                 onChange={handleChange}
                 id="furnished" className='w-5' />
                 <span>Furnished </span>
             </div>
            </div>
              <div className='flex items-center gap-2'>
                <label className='font-semibold' >Sort : </label>
                 <select  id="sort_order"
                  onChange={handleChange}
                  value={`${sidebardata.sort}_${sidebardata.order}`}
                  className='border rounded-lg p-3'>
                   <option value="regularPrice_desc">Price high to low</option>
                   <option value="regularPrice_asc">Price low to high</option>
                   <option value="createdAt_desc">Latest</option>
                  <option value="createdAt_asc">Oldest</option>
                  </select>
               </div>
               <button type='submit' className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95'>Search</button>
              </form>

     </div>
     <div className='    '>

        <h1 className='text-3xl font-semibold border-b p-3 mt-5 text-slate-700'>Listing results:</h1>

     </div>

    </div>
  )
}

export default Search
