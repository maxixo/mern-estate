import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

export const createListing = async (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return next(errorHandler(400, 'Request body is empty or invalid JSON'));
    }

    try {
        const listing = await Listing.create(req.body);
        return res.status(201).json(listing);
    } catch (error) {
        next(error);
    }
};

export const getListing = async (req, res, next) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return next(errorHandler(404, 'Listing not found'));
        }

        return res.status(200).json(listing);
    } catch (error) {
        if (error.name === 'CastError') {
            return next(errorHandler(400, 'Invalid listing id'));
        }
        next(error);
    }
};

export const deleteListing = async  (req, res , next) => {
     const listing = await Listing.findById(req.params.id);

     if(!listing) {
        return next(errorHandler(404, 'Listing not found'));
     }

     if (req.user.id !== listing.userRef) {
        return next(errorHandler(401, 'You can only delete your own listings'))
     }


     try {
        await Listing.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Listing deleted successfully' });
     } catch (error) {
         next(error)
     }

}


export const updateListing = async (req, res, next) => {
      const listing = await Listing.findById(req.params.id);
    
      if(!listing) {
        return next(errorHandler(404, 'Listing not found'));
      }

      if (req.user.id !== listing.userRef) {
        return next(errorHandler(401, 'You can only update your own listings'))
     
      }

      try {
        const updatedListing = await Listing.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true }
        );
        res.status(200).json(updatedListing);
      } catch (error) {
        next(error);
      }
}

export const showlisting = async (req, res, next) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return next(errorHandler(404, 'Listing not found'));
        }

        return res.status(200).json(listing);
    } catch (error) {
        if (error.name === 'CastError') {
            return next(errorHandler(400, 'Invalid listing id'));
        }
        next(error);
    }
};


export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    const parseFlag = (value) => {
      if (value === undefined) return { $in: [true, false] };
      if (value === "true") return true;
      if (value === "false") return { $in: [true, false] };
      return { $in: [true, false] };
    };

    const offer = parseFlag(req.query.offer);
    const furnished = parseFlag(req.query.furnished);
    const parking = parseFlag(req.query.parking);

    let type = req.query.type;
    if (!type || type === "all") {
      type = { $in: ["rent", "sale"] };
    }

    const searchTerm = req.query.searchTerm || "";
    const sort = req.query.sort || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: "i" },
      offer,
      furnished,
      parking,
      type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
