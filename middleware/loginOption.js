const pool = require("../dbconfig/dbconfig");
const passport = require("passport");

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

const GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.Client_ID,
      clientSecret: process.env.Client_secret,
      callbackURL: `http://localhost:${
        process.env.PORT || 8000
      }/api/user/google/callback`,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        const checkUser = await pool.query(
          "select * from users where email=$1 and is_deleted='false'",
          [profile.email]
        );

        if (checkUser.rows[0] == null) {
          const newUser = await pool.query(
            "insert into users(email,google_id,created_at) values($1,$2,current_timestamp) RETURNING *",
            [profile.email, profile.id]
          );
          return done(null, newUser.rows[0]);
        } else {
          return done(null, checkUser.rows[0]);
        }
      } catch (error) {
        return done(err, { message: "Error on Google Login" });
      }
    }
  )
);
