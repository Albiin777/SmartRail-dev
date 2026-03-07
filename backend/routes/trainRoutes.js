import { Router } from 'express';
import {
    getTrainDetails,
    getTrainSchedule,
    getTrainsBetween,
    searchStations,
    searchTrains,
} from '../controllers/trainController.js';

const router = Router();

// Search / autocomplete (must be BEFORE /:trainNumber to avoid conflict)
router.get('/search/stations', searchStations);
router.get('/search/trains', searchTrains);

// Search trains between two stations
router.get('/between', getTrainsBetween);

// Train details by number
router.get('/:trainNumber', getTrainDetails);

// Full schedule for a train
router.get('/:trainNumber/schedule', getTrainSchedule);

export default router;
