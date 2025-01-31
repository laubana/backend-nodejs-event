import Event from "../models/Event.mjs";

export const getAllEvents = async (_, res) => {
  try {
    const existingEvents = await Event.find().lean();

    res.status(200).json({ message: "", data: existingEvents });
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Server Error" });
  }
};

export const getEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const existingEvent = await Event.findById(eventId).lean();

    res.status(200).json({ message: "", data: existingEvent });
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Server Error" });
  }
};

export const getFeaturedEvents = async (_, res) => {
  try {
    const existingEvents = await Event.find({ isFeatured: true }).lean();

    res.status(200).json({ message: "", data: existingEvents });
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Server Error" });
  }
};

export const getFilteredEvents = async (req, res) => {
  try {
    const { year, month } = req.params;

    const existingEvents = await Event.find({
      date: new RegExp(`^${year}-${month}`),
    }).lean();

    res.status(200).json({ message: "", data: existingEvents });
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Server Error" });
  }
};
