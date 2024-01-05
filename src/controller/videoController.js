export const trending = (req, res) => {
  const videos = [
    {
      title: "First Video",
      rating: 5,
      comments: 2,
      createdAt: "2 minutes ago",
      views: 59,
      id: 1,
    },
    {
      title: "Second Video",
      rating: 4.5,
      comments: 20,
      createdAt: "50 minutes ago",
      views: 80,
      id: 2,
    },
    {
      title: "Third Video",
      rating: 4,
      comments: 8,
      createdAt: "2 days ago",
      views: 200,
      id: 3,
    },
  ];
  res.render("home", { pageTitle: "Home", videos });
};
export const see = (req, res) => res.render("watch", { pageTitle: "Watch" });
export const edit = (req, res) => res.render("edit", { pageTitle: "Edit" });

export const search = (req, res) => res.send("Search");
export const upload = (req, res) => res.send("Upload");
export const deleteVedio = (req, res) => {
  return res.send("Delete Vedio");
};
