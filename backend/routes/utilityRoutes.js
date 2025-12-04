
import express from "express";
import { lookupPincode } from "../utils/pincodeLookup.js"; // Import the utility function

const router = express.Router();

// GET /api/utilities/pincode/:pincode
// Handles the Pincode lookup request from the frontend
router.get("/pincode/:pincode", async (req, res) => {
  const { pincode } = req.params;

  try {
    // 1. Validate Pincode format
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid Pincode format. Must be 6 digits." 
      });
    }

    // 2. Call the Pincode Lookup Utility
    const locationData = await lookupPincode(pincode);

    if (locationData) {
      // 3. Success: return the District and State as JSON
      return res.json({ 
        success: true, 
        district: locationData.district, 
        state: locationData.state 
      });
    } else {
      // 4. Failure: return 404 if Pincode is not found in the external database
      return res.status(404).json({ 
        success: false, 
        message: `No location found for Pincode: ${pincode}` 
      });
    }

  } catch (error) {
    console.error("Pincode Lookup Route Error:", error);
    // 5. Server error (e.g., external API down)
    res.status(500).json({ 
      success: false, 
      message: "Server error during Pincode lookup." 
    });
  }
});

export default router;