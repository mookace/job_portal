const userController = {};
const pool = require("../../dbconfig/dbconfig");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const sendmail = require("../../middleware/email");

userController.registerUser = async (req, res) => {
  try {
    const user = req.body;

    user.email = user.email.toLowerCase();
    const enterEmail = await pool.query(
      "select email from users where email=$1",
      [user.email]
    );

    if (enterEmail.rows.length != 0) {
      req.flash("Errmsg", "Email already exist");
      return res.status(400).redirect("/front/register");
    } else {
      let passwordHashing = CryptoJS.AES.encrypt(
        user.password,
        process.env.SECRET_KEY
      ).toString();
      await pool.query(
        "insert into users(email,password,created_at) values($1,$2,current_timestamp) RETURNING *",
        [user.email, passwordHashing]
      );
      req.flash("message", "Successfully Register");
      return res.status(201).redirect("/front/login");
    }
  } catch (error) {
    return res.status(500).send({ message: "internal server error", error });
  }
};

// login
userController.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.toLowerCase();
    const findemail = await pool.query(
      "select * from users where email=$1 and is_deleted='false'",
      [email]
    );
    const data = findemail.rows[0];

    if (data) {
      const unhashPassword = CryptoJS.AES.decrypt(
        data.password,
        process.env.SECRET_KEY
      );
      const originalPassword = unhashPassword.toString(CryptoJS.enc.Utf8);

      if (password === originalPassword) {
        const user = {
          id: data.id,
          email: data.email,
          role: data.role,
        };
        const accessToken = jwt.sign(user, process.env.JWT_SEC, {
          expiresIn: "12h",
        });

        res.cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60 * 12,
        });

        req.flash("message", "Successfully Login");
        return res.status(200).redirect("/front/homepage");
      } else {
        req.flash("Errmsg", "invalid password");
        return res.status(400).redirect("/front/login");
      }
    } else {
      req.flash("Errmsg", "invalid email");
      return res.status(400).redirect("/front/login");
    }
  } catch (error) {
    return res.status(500).send({ message: "internal server error", error });
  }
};

userController.googleLogin = async (req, res) => {
  try {
    const googleUser = req.session.passport.user;
    if (googleUser) {
      const user = {
        id: googleUser.id,
        email: googleUser.email,
        role: googleUser.role,
      };
      const accessToken = jwt.sign(user, process.env.JWT_SEC, {
        expiresIn: "12h",
      });

      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 12,
      });

      req.flash("message", "Successfully Login");
      return res.status(200).redirect("/front/homepage");
    } else {
      req.flash("Errmsg", "Error in google Login");
      return res.status(400).redirect("/front/login");
    }
  } catch (error) {
    return res.status(500).send({ message: "internal server error", error });
  }
};

userController.allJobs = async (req, res) => {
  try {
    const userid = req.user.id;
    const allJobsList = await pool.query(
      "select * from jobs where is_deleted='false' ORDER BY created_at DESC"
    );
    return res
      .status(200)
      .send({ status: "success", data: allJobsList.rows, userid: userid });
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error });
  }
};

userController.searchJob = async (req, res) => {
  try {
    const user = req.user;
    let job_title = req.body.search || req.query.job_title;
    return res
      .status(200)
      .redirect(
        "/front/searchjobs?job_title=" + job_title + "&userid=" + user.id
      );
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error });
  }
};

userController.profileUpdate = async (req, res) => {
  try {
    const userId = req.user;
    const profile = req.body.fullname;
    let cvName = req.filename;

    await pool.query(
      "update users set fullname=$1,cv=$2,updated_at=current_timestamp where id=$3 RETURNING *",
      [profile, cvName, userId.id]
    );
    req.flash("message", "Profile Updated Successfully");
    return res.status(201).redirect("/front/homepage");
  } catch (error) {
    return res.status(500).send({ message: "internal server error", error });
  }
};

userController.singleUser = async (req, res) => {
  try {
    const userid = req.query.id;
    const newUserId = req.query.userid;
    if (newUserId) {
      const userDetails = await pool.query(
        "select * from users where id=$1 and is_deleted='false'",
        [newUserId]
      );
      return res
        .status(200)
        .send({ status: "success", userData: userDetails.rows[0] });
    }
    return res.status(200).redirect("/front/profile?userid=" + userid);
  } catch (error) {
    return res.status(500).send({ message: "internal server error", error });
  }
};

userController.applyJob = async (req, res) => {
  try {
    const userData = req.user;
    const jobId = req.query.id;
    let checkCV = await pool.query(
      "select cv from users where email=$1 and is_deleted='false'",
      [userData.email]
    );
    const data = checkCV.rows;
    const newData = data.map((e) => e.cv);

    if (newData[0] == null) {
      req.flash("Errmsg", "Please update your profile");
      return res.status(400).redirect("/front/homepage");
    } else {
      const alladmin = await pool.query(
        "select * from users where role='admin' and is_deleted='false'"
      );

      const allAdminEmail = alladmin.rows.map((e) => e.email);

      await pool.query(
        "insert into jobapplied(job_id,user_id,applied_at) values($1,$2,current_timestamp) returning *",
        [jobId, userData.id]
      );
      const jobDetails = await pool.query("select * from jobs where id=$1", [
        jobId,
      ]);

      // send email to admin
      await allAdminEmail.forEach((email) =>
        sendmail.send_mail(
          userData.email,
          email,
          jobDetails.rows[0].job_title,
          jobDetails.rows[0].company_name
        )
      );

      // send email to User
      await sendmail.user_mail(
        userData.email,
        jobDetails.rows[0].job_title,
        jobDetails.rows[0].company_name
      );

      req.flash("message", "Job applied successfully");
      return res.status(200).redirect("/front/homepage");
    }
  } catch (error) {
    return res.status(500).send({ message: "internal server error", error });
  }
};

userController.getJobIdFromJobapplied = async (req, res) => {
  try {
    const userid = req.query.userid;
    const apply = await pool.query(
      "select job_id from jobapplied where user_id=$1 and is_deleted='false'",
      [userid]
    );
    return res.status(200).send({ status: "success", data: apply.rows });
  } catch (error) {
    return res.status(500).send({ message: "internal server Error" });
  }
};

userController.searchResult = async (req, res) => {
  try {
    let job_title = req.query.job_title;
    job_title = "%" + job_title.toLowerCase() + "%";

    const result = await pool.query(
      `select * from jobs where job_title LIKE $1 AND is_deleted='false' ORDER BY created_at DESC`,
      [job_title]
    );
    return res.status(200).send({ status: "success", data: result.rows });
  } catch (error) {
    return res.status(500).send({ message: "internal server Error" });
  }
};

userController.searchApplyJob = async (req, res) => {
  try {
    const userData = req.user;
    const jobId = req.query.id;
    let checkCV = await pool.query(
      "select cv from users where email=$1 AND is_deleted='false'",
      [userData.email]
    );
    const data = checkCV.rows;
    const newData = data.map((e) => e.cv);

    if (newData[0] == null) {
      const job_title = await pool.query(
        "select job_title from jobs where id=$1 AND is_deleted='false'",
        [jobId]
      );

      req.flash("Errmsg", "Please update your profile");
      return res
        .status(400)
        .redirect(
          "/front/searchjobs?job_title=" +
            job_title.rows[0].job_title +
            "&userid=" +
            userData.id
        );
    } else {
      const alladmin = await pool.query(
        "select * from users where role='admin' and is_deleted='false'"
      );

      const allAdminEmail = alladmin.rows.map((e) => e.email);

      await pool.query(
        "insert into jobapplied(job_id,user_id,applied_at) values($1,$2,current_timestamp) returning *",
        [jobId, userData.id]
      );
      const jobDetails = await pool.query("select * from jobs where id=$1", [
        jobId,
      ]);
      // send email to admin
      await allAdminEmail.forEach((email) =>
        sendmail.send_mail(
          userData.email,
          email,
          jobDetails.rows[0].job_title,
          jobDetails.rows[0].company_name
        )
      );
      // send email to user
      await sendmail.user_mail(
        userData.email,
        jobDetails.rows[0].job_title,
        jobDetails.rows[0].company_name
      );

      req.flash("message", "Job applied successfully");
      return res
        .status(201)
        .redirect(
          "/api/user/searchjobs?job_title=" + jobDetails.rows[0].job_title
        );
    }
  } catch (error) {
    return res.status(500).send({ message: "internal server error", error });
  }
};

userController.changaPassword = async (req, res) => {
  try {
    const userid = req.query.id;
    const id = req.query.updateid;

    const changaPassword = req.body;

    if (changaPassword.confirmNewPassword && id) {
      const findemail = await pool.query(
        "select * from users where id=$1 AND is_deleted='false'",
        [id]
      );
      const data = findemail.rows[0];

      const unhashPassword = CryptoJS.AES.decrypt(
        data.password,
        process.env.SECRET_KEY
      );
      const originalPassword = unhashPassword.toString(CryptoJS.enc.Utf8);
      if (changaPassword.oldPassword === originalPassword) {
        if (changaPassword.newPassword === changaPassword.confirmNewPassword) {
          const passwordHashing = CryptoJS.AES.encrypt(
            changaPassword.confirmNewPassword,
            process.env.SECRET_KEY
          ).toString();

          await pool.query("update users set password=$1 where id=$2", [
            passwordHashing,
            id,
          ]);

          req.flash("message", "Password Change Successfully");
          return res.status(400).redirect("/front/changePassword?userid=" + id);
        } else {
          req.flash(
            "Errmsg",
            "Confirm Password Does Not Match with New Password"
          );
          return res.status(400).redirect("/front/changePassword?userid=" + id);
        }
      } else {
        req.flash("Errmsg", "Old Password Does Not Match");
        return res.status(400).redirect("/front/changePassword?userid=" + id);
      }
    }
    return res.status(200).redirect("/front/changePassword?userid=" + userid);
  } catch (error) {
    return res.status(500).send({ message: "internal server error", error });
  }
};

userController.logout = async (req, res) => {
  try {
    const user = req.user;
    await pool.query(`update users set is_active='false' where id=${user.id}`);
    res.cookie("accessToken", "", { maxAge: 1 });
    req.flash("message", "Successfully Logout");
    return res.status(200).redirect("/front/login");
  } catch (error) {
    return res.status(500).send({ message: "internal server error", error });
  }
};

module.exports = userController;
