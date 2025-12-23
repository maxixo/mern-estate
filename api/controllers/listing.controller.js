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
