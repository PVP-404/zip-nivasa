
import axios from "axios";

/**
 * Fetches District and State based on an Indian Pincode using the Post Office API.
 * @param {string} pincode - The 6-digit Indian Pincode.
 * @returns {{district: string, state: string} | null} - Location details or null if not found.
 */
export async function lookupPincode(pincode) {
  if (!/^\d{6}$/.test(pincode)) {
    console.warn(`Invalid pincode format: ${pincode}`);
    return null;
  }

  try {
    // Public API for Indian Pincode lookup
    const url = `https://api.postalpincode.in/pincode/${pincode}`;
    
    const response = await axios.get(url);
    const data = response.data;

    if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice.length > 0) {
      // The API returns a list of post offices. We use the details from the first entry.
      const postOffice = data[0].PostOffice[0];
      
      const district = postOffice.District;
      const state = postOffice.State;
      
      console.log(`Pincode ${pincode} lookup successful: ${district}, ${state}`);

      return { district, state };
    } else {
      console.log(`Pincode ${pincode} lookup failed or no data found.`);
      return null;
    }

  } catch (error) {
    console.error("Pincode Lookup API Error:", error.message);
    return null;
  }
}