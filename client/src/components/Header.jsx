import {FaSearch} from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Header = () => {

  const {currentUser} = useSelector((state) => state.user);
  const avatarSrc =
    typeof currentUser?.avatar === "string" && currentUser.avatar.trim()
      ? currentUser.avatar
      : null;
  
  return  (
  <header className='bg-slate-200 shadow-md'>
    <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>
      <Link to='/'>
       <h1 className='font-bold  text-sm sm:text-xl flex flex-wrap'>
        <span className='text-slate-500'>Soul</span>
        <span className='text-slate-700'>Estate</span>
      </h1>
      </Link>
      
    <form action="" className='bg-slate-100 p-3 rounded-lg flex items-center'>
     <input type="text" placeholder='Search..' className='bg-transparent focus:outline-none w-24 sm:w-64' />
     <FaSearch className=' text-slate-600'/>
    </form>
    <ul className='flex gap-4'>
      <Link to="/home">
       <li className='hidden sm:inline text-slate-700 hover:underline'>Home</li>
     </Link>
        <Link to="/about">


      <li  className='hidden sm:inline text-slate-700 hover:underline'>About</li>
        </Link>
         <Link to="/profile">

     {currentUser ? (        
        avatarSrc ? (
          <img className='rounded-full h-7 w-7 object-cover' src={avatarSrc} alt="profile" />
        ) : (
          <div
            className='rounded-full h-7 w-7 bg-slate-400 text-white flex items-center justify-center text-xs font-semibold'
            aria-label="profile"
          >
            {(currentUser?.username || "?").slice(0, 1).toUpperCase()}
          </div>
        )
        ) :
          ( <li  className=' sm:inline text-slate-700 hover:underline'>Sign-in</li>
       )}

        </Link>
    </ul>
   
    </div>
    
  </header> 
   )
}

export default Header
