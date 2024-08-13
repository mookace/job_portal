const express = require("express");
const router = express.Router();
const adminController = require("../../controller/users/adminUserController");
const middleware = require("../../middleware/middleware");
const validation = require("../../controller/users/adminUserValidate");

//New route
router.post("/login", adminController.login);

router.post(
  "/postjob",
  middleware.authentication,
  middleware.authorizationForAdmin,
  validation.JobSanitizer,
  adminController.postJobs
);

router.get(
  "/getalljobs",
  middleware.authentication,
  middleware.authorizationForAdmin,
  adminController.allJobs
);

router.post(
  "/searchjobs",
  middleware.authentication,
  middleware.authorizationForAdmin,
  adminController.searchByjobTitle
);

router.get(
  "/jobdetails",
  middleware.authentication,
  middleware.authorizationForAdmin,
  adminController.jobDetails
);

router.get(
  "/deletejob",
  middleware.authentication,
  middleware.authorizationForAdmin,
  adminController.deleteJob
);

router.get(
  "/allusers",
  middleware.authentication,
  middleware.authorizationForAdmin,
  adminController.allusers
);

router.get(
  "/userdetails",
  middleware.authentication,
  middleware.authorizationForAdmin,
  adminController.userDetails
);

router.post(
  "/searchuser",
  middleware.authentication,
  middleware.authorizationForAdmin,
  adminController.searchUser
);

router.get(
  "/updateprofile",
  middleware.authentication,
  middleware.authorizationForAdmin,
  adminController.updateProfile
);

router.post(
  "/updateprofile",
  middleware.authentication,
  middleware.authorizationForAdmin,
  adminController.updateProfile
);

router.get(
  "/deleteprofile",
  middleware.authentication,
  middleware.authorizationForAdmin,
  adminController.deleteProfile
);

router.get(
  "/downloadfile",
  middleware.authentication,
  middleware.authorizationForAdmin,
  adminController.downloadFile
);

router.get(
  "/logout",
  middleware.authenticationForLogout,
  middleware.authorizationForAdmin,
  adminController.logout
);

module.exports = router;
