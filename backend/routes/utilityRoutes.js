
import express from "express";
import { lookupPincode } from "../utils/pincodeLookup.js";

const router = express.Router();
router.get("/pincode/:pincode", async (req, res) => {
  const { pincode } = req.params;

  try {
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid Pincode format. Must be 6 digits." 
      });
    }

    const locationData = await lookupPincode(pincode);

    if (locationData) {
      return res.json({ 
        success: true, 
        district: locationData.district, 
        state: locationData.state 
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        message: `No location found for Pincode: ${pincode}` 
      });
    }

  } catch (error) {
    console.error("Pincode Lookup Route Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during Pincode lookup." 
    });
  }
});

export default router;