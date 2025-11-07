import PG from "../models/pgModel.js";

// ✅ Create PG listing
export const createPG = async (data) => {
  const pg = new PG(data);
  return await pg.save();
};

// ✅ Fetch all PG listings (latest first)
export const getAllPGs = async () => {
  return await PG.find().sort({ createdAt: -1 });
};
