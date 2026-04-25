import { Router } from "express";
import { requireAuth } from "../../shared/auth/requireAuth.js";
import {
  createTripSchema,
  patchItinerarySchema,
  regenerateDaySchema,
  updateTripSchema,
} from "./trips.validation.js";
import {
  createTrip,
  deleteTrip,
  generateTrip,
  getTrip,
  listTrips,
  regenerateDay,
  saveItinerary,
  updateTrip,
} from "./trips.service.js";

export const tripsRouter = Router();

tripsRouter.use(requireAuth);

tripsRouter.get("/", async (req, res, next) => {
  try {
    const trips = await listTrips(req.user!.id);
    return res.json({ trips });
  } catch (err) {
    return next(err);
  }
});

tripsRouter.post("/", async (req, res, next) => {
  try {
    const body = createTripSchema.parse(req.body);
    const trip = await createTrip(req.user!.id, body);
    return res.status(201).json({ trip });
  } catch (err) {
    return next(err);
  }
});

tripsRouter.get("/:id", async (req, res, next) => {
  try {
    const trip = await getTrip(req.user!.id, req.params.id);
    return res.json({ trip });
  } catch (err) {
    return next(err);
  }
});

tripsRouter.put("/:id", async (req, res, next) => {
  try {
    const body = updateTripSchema.parse(req.body);
    const trip = await updateTrip(req.user!.id, req.params.id, body);
    return res.json({ trip });
  } catch (err) {
    return next(err);
  }
});

tripsRouter.delete("/:id", async (req, res, next) => {
  try {
    await deleteTrip(req.user!.id, req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

tripsRouter.post("/:id/generate", async (req, res, next) => {
  try {
    const trip = await generateTrip(req.user!.id, req.params.id);
    return res.json({ trip });
  } catch (err) {
    return next(err);
  }
});

tripsRouter.post("/:id/regenerate-day", async (req, res, next) => {
  try {
    const body = regenerateDaySchema.parse(req.body);
    const trip = await regenerateDay(req.user!.id, req.params.id, body.day, body.notes);
    return res.json({ trip });
  } catch (err) {
    return next(err);
  }
});

tripsRouter.put("/:id/itinerary", async (req, res, next) => {
  try {
    const body = patchItinerarySchema.parse(req.body);
    const trip = await saveItinerary(req.user!.id, req.params.id, body.itinerary);
    return res.json({ trip });
  } catch (err) {
    return next(err);
  }
});

