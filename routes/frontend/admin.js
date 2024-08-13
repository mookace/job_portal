const express = require("express");
const router = express.Router();
const axios = require("axios");
const pool = require("../../dbconfig/dbconfig");

router.get("/alljobs", async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).send({ message: "No Token available" });
    }
    const alljobs = await axios.get(
      `http://localhost:${process.env.PORT || 8000}/api/admin/getalljobs`,
      {
        headers: { Authorization: "Bearer " + token },
        withCredentials: true,
      }
    );

    return res.render("allJobs", {
      alljobs: alljobs.data.data,
      message: req.flash("message"),
      Errmsg: req.flash("Errmsg"),
    });
  } catch (error) {
    return res.send(error);
  }
});

router.get("/searchjobs", async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).send({ message: "No Token available" });
    }
    const alljobs = await axios.get(
      `http://localhost:${process.env.PORT || 8000}/api/admin/getalljobs`,
      {
        headers: { Authorization: "Bearer " + token },
        withCredentials: true,
        params: { job_title: req.query.job_title },
      }
    );

    return res.render("searchAllJobsAdmin", {
      alljobs: alljobs.data.data,
      message: req.flash("message"),
      Errmsg: req.flash("Errmsg"),
    });
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error", error });
  }
});

router.get("/login", async (req, res) => {
  try {
    return res.render("loginAdmin", {
      message: req.flash("message"),
      Errmsg: req.flash("Errmsg"),
    });
  } catch (error) {
    return res.send(error);
  }
});

router.get("/homepage", async (req, res) => {
  try {
    return res.render("homepageAdmin", {
      message: req.flash("message"),
      Errmsg: req.flash("Errmsg"),
    });
  } catch (error) {
    return res.send(error);
  }
});

router.get("/jobdetails", async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).send({ message: "No Token available" });
    }
    const all = await axios.get(
      `http://localhost:${process.env.PORT || 8000}/api/admin/jobdetails`,
      {
        headers: { Authorization: "Bearer " + token },
        withCredentials: true,
        params: { jobidjob: req.query.jobId },
      }
    );

    return res.render("jobDetails", {
      data: all.data.data,
      alljobs: all.data.alljobs,
      Errmsg: req.flash("Errmsg"),
      message: req.flash("message"),
    });
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/allusers", async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.send({ message: "No Token available" });
    }
    const allusers = await axios.get(
      `http://localhost:${process.env.PORT || 8000}/api/admin/allusers`,
      {
        headers: { Authorization: "Bearer " + token },
        withCredentials: true,
        params: { email: req.query.email },
      }
    );
    return res.render("allusers", {
      allusers: allusers.data.data,
      message: req.flash("message"),
      Errmsg: req.flash("Errmsg"),
    });
  } catch (error) {
    return res.send(error);
  }
});

router.get("/userdetails", async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.send({ message: "No Token available" });
    }
    const allusers = await axios.get(
      `http://localhost:${process.env.PORT || 8000}/api/admin/userdetails`,
      {
        headers: { Authorization: "Bearer " + token },
        withCredentials: true,
        params: { idid: req.query.userid },
      }
    );
    return res.render("singleUserDetails", { data: allusers.data.data });
  } catch (error) {
    return res.send(error);
  }
});

router.get("/updateprofile", async (req, res) => {
  try {
    return res.render("adminUpdateUserProfile");
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/deleteprofile", async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.send({ message: "No Token available" });
    }
    const allusers = await axios.get(
      `http://localhost:${process.env.PORT || 8000}/api/admin/allusers`,
      {
        headers: { Authorization: "Bearer " + token },
        withCredentials: true,
      }
    );

    const deleteuser = await axios.get(
      `http://localhost:${process.env.PORT || 8000}/api/admin/deleteprofile`,
      {
        headers: { Authorization: "Bearer " + token },
        withCredentials: true,
        params: { deleteId: req.query.deleteId },
      }
    );

    if (deleteuser.data.data) {
      if (deleteuser.data.status === "Fail") {
        req.flash("Errmsg", "Super Admin Cannot be Deleted");
      } else {
        req.flash("message", "User Deleted Successfully");
      }
    } else {
      req.flash("Errmsg", "Failed To Delete User");
    }

    return res.redirect("allusers");
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/logout", async (req, res) => {
  try {
    return res.render("loginAdmin", {
      message: req.flash("message"),
      Errmsg: req.flash("Errmsg"),
    });
  } catch (error) {
    return res.status(500).send({ message: "internal server error", error });
  }
});

module.exports = router;
