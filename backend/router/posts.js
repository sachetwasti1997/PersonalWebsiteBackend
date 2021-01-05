const express = require("express");
const router = express.Router();
const multer = require("multer");

const checkAuth = require("../middleware/check-auth");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //callback is used to pass the information where multer should pass storage area
    const isValid = MIME_TYPE_MAP[file.mimetype];
    console.log(isValid);
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    console.log(ext);
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

const Post = require("../models/posts");

router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId,
    });
    post.save().then((createdPost) => {
      const postCreated = {
        ...createdPost,
      };
      res.status(200).json(postCreated);
    });
  }
);

router.get("", (req, res, next) => {
  console.log("GET method called!");
  let post = [];
  Post.find().then((result) => {
    if (result.length === 0) {
      res.status(404).json({
        message: "Could not find posts",
        posts: result,
      });
    } else {
      console.log(result);
      result.forEach((value) => {
        post.push(value);
      });
      res.status(200).json(post);
    }
  });
});

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }
    const post = new Post({
      _id: req.body._id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      creator: req.userData.userId,
    });
    Post.updateOne(
      { _id: req.params.id, creator: req.userData.userId },
      post
    ).then((result) => {
      if (result.nModified > 0) {
        res.status(200).json({ message: "Update Successfully" });
      } else {
        res.status(401).json({ message: "Cannot Update!" });
      }
    });
  }
);

router.get("/get/:id", (req, res, next) => {
  Post.findById({ _id: req.params.id }).then((result) => {
    if (result) {
      res.status(200).json(result);
    } else {
      res
        .status(404)
        .json({ message: "Cannot find the post so cannot update!" });
    }
  });
});

router.delete("/delete/:id", checkAuth, (req, res, next) => {
  console.log(req.params.id);
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Update Successfully" });
      } else {
        res.status(401).json({ message: "Cannot Delete!" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: err.toString() });
    });
});

module.exports = router;
