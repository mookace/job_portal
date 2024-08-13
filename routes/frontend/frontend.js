const express = require("express");
const router = express.Router();
const axios = require("axios");
const { render } = require("ejs");

router.get("/homepage", async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).send({ message: "No Token available" });
    }
    const alljobs = await axios.get(`/api/user/getalljobs`, {
      headers: { Authorization: "Bearer " + token },
      withCredentials: true,
    });

    const apply = await axios.get(`/api/user/jobid`, {
      headers: { Authorization: "Bearer " + token },
      withCredentials: true,
      params: { userid: alljobs.data.userid },
    });

    const alljobid = apply.data.data;
    const onlyjobid = alljobid.map((e) => e.job_id);

    return res.render("index", {
      userid: alljobs.data.userid,
      alljobs: alljobs.data.data,
      onlyjobid: onlyjobid,
      message: req.flash("message"),
      Errmsg: req.flash("Errmsg"),
    });
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error });
  }
});

router.get("/login", async (req, res) => {
  try {
    return res.render("login", {
      message: req.flash("message"),
      Errmsg: req.flash("Errmsg"),
    });
  } catch (error) {
    return res.status(500).send({ message: "internal server error", error });
  }
});

router.get("/register", async (req, res) => {
  try {
    return res.render("register", { Errmsg: req.flash("Errmsg") });
  } catch (error) {
    return res.status(500).send({ message: "internal server error", error });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).send({ message: "No Token available" });
    }
    const singleUser = await axios.get(`/api/user/singleuser`, {
      headers: { Authorization: "Bearer " + token },
      withCredentials: true,
      params: { userid: req.query.userid },
    });
    return res.render("profile", { userData: singleUser.data.userData });
  } catch (error) {
    return res.status(500).send({ message: "internal server error", error });
  }
});

router.get("/searchjobs", async (req, res) => {
  try {
    const job_title = req.query.job_title;

    const userid = req.query.userid;

    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).send({ message: "No Token available" });
    }
    const result = await axios.get(`/api/user/searchresult`, {
      headers: { Authorization: "Bearer " + token },
      withCredentials: true,
      params: { job_title: job_title },
    });

    const apply = await axios.get(`/api/user/jobid`, {
      headers: { Authorization: "Bearer " + token },
      withCredentials: true,
      params: { userid: userid },
    });

    const alljobid = apply.data.data;
    const onlyjobid = alljobid.map((e) => e.job_id);

    return res.render("search", {
      userid: userid,
      alljobs: result.data.data,
      onlyjobid: onlyjobid,
      message: req.flash("message"),
      Errmsg: req.flash("Errmsg"),
    });
  } catch (error) {
    return res.status(500).send({ message: "internal server error", error });
  }
});

router.get("/changePassword", async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).send({ message: "No Token available" });
    }
    const singleUser = await axios.get(`/api/user/singleuser`, {
      headers: { Authorization: "Bearer " + token },
      withCredentials: true,
      params: { userid: req.query.userid },
    });
    return res.render("changePassword", {
      userData: singleUser.data.userData,
      Errmsg: req.flash("Errmsg"),
      message: req.flash("message"),
    });
  } catch (error) {
    return res.status(500).send({ message: "internal server error", error });
  }
});

module.exports = router;
