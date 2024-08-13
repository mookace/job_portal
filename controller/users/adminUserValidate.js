const { check, validationResult } = require("express-validator");

exports.JobSanitizer = [
  check("company_name").trim(),
  check("job_title").trim(),
  check("no_of_openings").trim(),
  check("job_category").trim(),
  check("job_location").trim(),
  check("job_level").trim(),
  check("experience").trim(),
  check("expiry_date").trim(),
  check("skills").trim(),
  check("job_description").trim(),
  check("salary").trim(),
  (req, res, next) => {
    next();
  },
];
