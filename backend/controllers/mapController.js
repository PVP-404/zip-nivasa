// backend/controllers/mapController.js
export const mapHealth = (req, res) => {
  res.json({
    success: true,
    message: "Map API is live and Mappls is integrated on backend.",
  });
};
