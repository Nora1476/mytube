export const trending = (req, res) => res.send("Home page vedio");
export const see = (req, res) => {
  return res.send(`Watch Video #${req.params.id}`);
};
export const edit = (req, res) => {
  return res.send("Edit");
};

export const search = (req, res) => res.send("Search");
export const upload = (req, res) => res.send("Upload");
export const deleteVedio = (req, res) => {
  return res.send("Delete Vedio");
};
