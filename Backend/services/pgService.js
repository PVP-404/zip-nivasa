import Pg from "../models/pgModel.js";

// Fetch all PGs
export const getAllPGs = async () => {
  return await PG.find({});
};

// Add new PG
export const addPG = async (pgData) => {
  const pg = new Pg(pgData);
  return await pg.save();
};
