import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Client, Storage, ID } from "appwrite";

// Initialize Appwrite client (only for storage)
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT )
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const storage = new Storage(client);

const CreateListing = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [imageUploadSuccess, setImageUploadSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    imageUrls: [],
    type: 'rent',
    sale: false,
    rent: true,
    parking: false,
    furnished: false,
    offer: false,
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountedPrice: 0
  });

  console.log('Form Data:', formData);
  

  const handleChange = (e) => {
    const { id, value, checked, type } = e.target;
    
    setFormData((prev) => {
      if (id === 'sale' || id === 'rent') {
        return {
          ...prev,
          type: id,
          sale: id === 'sale',
          rent: id === 'rent',
        };
      }

      if (id === 'parking' || id === 'furnished' || id === 'offer') {
        return {
          ...prev,
          [id]: checked,
          ...(id === 'offer' && !checked ? { discountedPrice: 0 } : {}),
        };
      }

      if (type === 'number') {
        return {
          ...prev,
          [id]: value === '' ? '' : Number(value),
        };
      }

      if (type === 'text' || type === 'textarea' ) {
        return {
          ...prev,
          [id]: value,
        };
      }

      return {
        ...prev,
        [id]: type === 'checkbox' ? checked : value,
      };
    });
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    setImageUploadError("");
    setImageUploadSuccess("");
    
    if (!files || files.length === 0) {
      setImageUploadError("You must select a file before uploading.");
      return;
    }
    
    if (files.length > 6) {
      setImageUploadError("You can only upload a maximum of 6 images.");
      return;
    }
    
    setUploading(true);
    const promises = [];

    for (let i = 0; i < files.length; i++) {
      promises.push(storeImage(files[i]));
    }
    
    try {
      const urls = await Promise.all(promises);
      const nextImages = [...uploadedImages, ...urls];
      const nextFormData = {
        ...formData,
        imageUrls: nextImages,
      };
      setUploadedImages(nextImages);
      setFormData(nextFormData);
      console.log('Uploaded image URLs:', nextImages);
      setImageUploadError("");
      setImageUploadSuccess("Images uploaded successfully.");
    } catch (error) {
      console.error('Upload failed:', error);
      setImageUploadError(error.message || "Failed to upload images.");
      setImageUploadSuccess("");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveUploadedImage = (indexToRemove) => {
    setUploadedImages((prev) => {
      const nextImages = prev.filter((_, index) => index !== indexToRemove);
      setFormData((prevFormData) => ({
        ...prevFormData,
        imageUrls: nextImages,
      }));
      return nextImages;
    });
  };

  const storeImage = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Upload file to Appwrite Storage
        const response = await storage.createFile(
          import.meta.env.VITE_APPWRITE_BUCKET_ID,
          ID.unique(),
          file
        );
        
        // Get file URL
        const fileUrl = storage.getFileView(
          import.meta.env.VITE_APPWRITE_BUCKET_ID,
          response.$id
        );
        const fileUrlString =
          typeof fileUrl === 'string'
            ? fileUrl
            : fileUrl?.href || fileUrl?.toString?.();

        if (!fileUrlString) {
          throw new Error('Failed to generate file URL.');
        }

        console.log('File uploaded:', fileUrlString);
        
        resolve(fileUrlString);
      } catch (error) {
        console.error('Error uploading file:', error);
        reject(error);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    
    if (uploadedImages.length === 0) {
      setSubmitError('Please upload at least one image.');
      return;
    }

    if (!currentUser?._id) {
      setSubmitError('Please sign in to create a listing.');
      return;
    }

    if(+formData.regularPrice < + formData.discountedPrice) return setSubmitError('Discounted price must be less than regular price.');

    try {
      setLoading(true);
      
      // Prepare listing data for MongoDB
      const listingData = {
        ...formData,
        imageUrls: uploadedImages,
        userRef: currentUser._id,
      };

      console.log('Sending data to backend:', listingData);

      // Send to your MongoDB backend API
      const response = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(listingData)
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create listing');
      }

      console.log('Listing created successfully:', data);
      const listingId = data?._id || data?.id;
      if (!listingId) {
        throw new Error('Listing created but no id returned');
      }
      setSubmitSuccess('Listing created successfully.');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        address: '',
        imageUrls: [],
        type: 'rent',
        sale: false,
        rent: true,
        parking: false,
        furnished: false,
        offer: false,
        bedrooms: 1,
        bathrooms: 1,
        regularPrice: 0,
        discountedPrice: 0
      });
      setUploadedImages([]);
      setFiles([]);

      navigate(`/listing/${listingId}`);
      
      
    } catch (error) {
      console.error('Full error details:', error);
      console.error('Error message:', error.message);
      setSubmitError(error.message || 'Failed to create listing');
      setSubmitSuccess("");
    } finally {
      setLoading(false);
    }
  };
    
  const isRent = formData.rent;

  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className="text-3xl font-semibold text-center my-7">
        Create Listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className='flex flex-col sm:flex-row flex-1 gap-4'>
          <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 flex-1">
            <input 
              type="text" 
              placeholder="name" 
              className="border p-3 rounded-lg"
              id="name" 
              maxLength="62" 
              minLength="10" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
            <textarea 
              placeholder="description" 
              className="border p-3 rounded-lg"
              id="description" 
              maxLength="500"
              value={formData.description}
              onChange={handleChange}
              required 
            />
            <input 
              type="text" 
              placeholder="address" 
              className="border p-3 rounded-lg"
              id="address"
              value={formData.address}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="flex flex-col gap-6 mt-4 flex-1">
            <div className="flex gap-6 flex-wrap">
              <div className="flex gap-2">
                <input 
                  type="checkbox" 
                  id="sale" 
                  className='w-5'
                  checked={formData.sale}
                  onChange={handleChange}
                />
                <span>Sale</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="checkbox" 
                  id="rent" 
                  className='w-5'
                  checked={formData.rent && formData.type === 'rent'}
                  onChange={handleChange}
                />
                <span>Rent</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="checkbox" 
                  id="parking" 
                  className='w-5'
                  checked={formData.parking}
                  onChange={handleChange}
                />
                <span>Parking spot</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="checkbox" 
                  id="furnished" 
                  className='w-5'
                  checked={formData.furnished}
                  onChange={handleChange}
                />
                <span>Furnished</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="checkbox" 
                  id="offer" 
                  className='w-5'
                  checked={formData.offer}
                  onChange={handleChange}
                />
                <span>Offer</span>
              </div>
            </div>
            <div className='flex flex-wrap gap-6'> 
              <div className='flex items-center gap-2'>
                <input 
                  type="number" 
                  id="bedrooms" 
                  min="1" 
                  max="10"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className='p-3 border border-gray-300 rounded-lg'
                />
                <p>Beds</p>
              </div>
              <div className='flex items-center gap-2'>
                <input 
                  type="number" 
                  id="bathrooms" 
                  min="1" 
                  max="10"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className='p-3 border border-gray-300 rounded-lg'
                />
                <p>Baths</p>
              </div>
              <div className='flex items-center gap-2'>
                <input 
                  type="number" 
                  id="regularPrice" 
                  min="50"
                  max="1000000"
                  value={formData.regularPrice}
                  onChange={handleChange}
                  className='p-3 border border-gray-300 rounded-lg'
                />
                <div className='flex flex-col items-center'>
                  <p>Regular price</p>
                  {isRent && <span className='text-xs'>($/month)</span>}
                </div>
              </div>
              {formData.offer && (
                <div className='flex items-center gap-2'>
                  <input 
                    type="number" 
                    id="discountedPrice" 
                    min="50"
                    max="100000000"
                    value={formData.discountedPrice}
                    onChange={handleChange}
                    className='p-3 border border-gray-300 rounded-lg'
                  />
                  <div className='flex flex-col items-center'>
                    <p>Discount price</p>
                    {isRent && <span className='text-xs'>($/month)</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>

        
        <div className='flex flex-col flex-1 gap-4'>
          <p className='font-semibold'>Images:
            <span className='font-normal text-gray-700 ml-2'>The first image will be the cover (max 6)</span>
          </p>
          <div className='flex gap-4'>
            <input 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFiles(Array.from(e.target.files));
                  setImageUploadError("");
                  setImageUploadSuccess("");
                  console.log('Files selected:', e.target.files.length);
                }
              }}
              type="file" 
              id="images" 
              accept="image/*" 
              className='p-3 border border-gray-300 rounded w-full' 
              multiple
            />
            <button 
              type="button" 
              onClick={handleImageSubmit} 
              disabled={uploading}
              className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          
          {uploadedImages.length > 0 && (
            <div className='flex flex-col gap-2'>
              <p className='text-xs text-gray-600'>Uploaded {uploadedImages.length} image(s)</p>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                {uploadedImages.map((url, index) => (
                  <div key={`${url}-${index}`} className='flex flex-col items-center gap-1 '>
                    <img 
                      src={url} 
                      alt={`upload-${index}`}
                      className='w-30 h-30 object-cover rounded'
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveUploadedImage(index)}
                      className='text-xs text-red-700 border border-red-700 mt-2 rounded px-2 py-1 hover:shadow font-bold uppercase'
                    >
                      Delete
                    </button>
                  </div>

                ) )}
              
              </div>
            </div>
          )}

          {imageUploadError && (
            <p className='text-red-600 text-sm'>{imageUploadError}</p>
          )}
          {imageUploadSuccess && (
            <p className='text-green-600 text-sm'>{imageUploadSuccess}</p>
          )}
          
          <button 
            type="submit"
            disabled={loading || uploading}
            className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
          {submitError && (
            <p className='text-red-600 text-sm mt-2'>Failed to create listing: {submitError}</p>
          )}
          {submitSuccess && (
            <p className='text-green-600 text-sm mt-2'>{submitSuccess}</p>
          )}
        </div>
      </form> 
    </main>
  );
};

export default CreateListing;
