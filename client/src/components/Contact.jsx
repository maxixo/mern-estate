import {useEffect, useState} from 'react'
import { Link } from 'react-router-dom';


const Contact = ({listing}) => {

    const [landlord, setLandlord] =  useState(null);
    const [message, setMessage] = useState("");
    const onChange = (e) => setMessage(e.target.value);
    useEffect(() => { 

    const fetchLandlord = async () => {
        try {
            const response = await fetch(`/api/user/${listing.userRef}`);
            const data = await response.json();
            setLandlord(data);
        } catch (error) {
            console.error("Error fetching landlord:", error);
        }
    };

    fetchLandlord();
}, [listing.userRef]);



  return (
      <>
      {landlord && (
        <div className='flex flex-col gap-2'>
        <p>Contact   <span className='font-semibold'>{landlord.username}</span> for 
        <span className='font-semibold'> {listing.name.toLowerCase()}</span></p>    
        <textarea name="message"
         id="message" 
         rows="2" 
         value={message}
         placeholder='Enter your message here'
         onChange={onChange}
         className="w-full border p-3 rounded-lg "
            >
           </textarea>

              <Link
                to={`mailto:${landlord.email}?Subject=${listing.name}&body=${message}`}
                className="bg-slate-700 text-white rounded-md uppercase inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm hover:opacity-90 transition w-full sm:w-auto self-start"
              >
                Send Message
              </Link>
        </div>
        
      )}
      
      </>

)
}

export default Contact
