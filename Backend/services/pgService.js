import PG from "../models/pgModel.js";

export const createPG = async (data) => {
  const pg = new PG(data);
  return await pg.save();
};

export const getAllPGs = async () => {
  return await PG.find().sort({ createdAt: -1 });
};
