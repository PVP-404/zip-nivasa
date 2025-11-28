import axios from "axios";

const API = "http://localhost:5000/api/mess";

export const addMess = async (data) => {
    const formData = new FormData();

    // Append all data fields
    Object.entries(data).forEach(([key, value]) => {
        if (key === "images" && Array.isArray(value)) {
            value.forEach(img => formData.append("images", img)); // multiple images
        } else if (typeof value === "object") {
            formData.append(key, JSON.stringify(value)); // serialize objects
        } else {
            formData.append(key, value);
        }
    });

    const res = await axios.post(`${API}/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
};

export const getAllMesses = async () => {
    const res = await axios.get(`${API}/all`);
    return res.data;
};

export const getMessesByOwner = async (ownerId) => {
    const res = await axios.get(`${API}/owner/${ownerId}`);
    return res.data;
};

export const updateMess = async (id, data) => {
    const res = await axios.put(`${API}/${id}`, data);
    return res.data;
};

export const deleteMess = async (id) => {
    const res = await axios.delete(`${API}/${id}`);
    return res.data;
};

export const publishSpecial = async (data) => {
    const res = await axios.post(`${API}/publish-special`, data);
    return res.data;
};

// export const getAllMess = async () => {
//   const res = await fetch(API);
//   return res.json();
// };

export const getMessById = async (id) => {
    const res = await axios.get(`${API}/${id}`);
    return res.data;

};

export const submitMessRating = async (messId, ratingData) => {
    const res = await fetch(`${API}/${messId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratingData),
    });
    return res.json();
};
