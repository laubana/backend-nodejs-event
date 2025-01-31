import express from "express";

import {
  getAllEvents,
  getEvent,
  getFeaturedEvents,
  getFilteredEvents,
} from "../controllers/event.mjs";

const router = express.Router();

router.route("/events").get(getAllEvents);
router.route("/event/:eventId").get(getEvent);
router.route("/featured-events").get(getFeaturedEvents);
router.route("/filtered-events/:year/:month").get(getFilteredEvents);

export default router;
