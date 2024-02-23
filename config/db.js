const mongoose = require("mongoose");

exports.connect = async (dbUrl) => {
  try {
    const conn = await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(
      `MongoDB Connected: ${conn.connection.host}
          || DB Name : ${conn.connections[0].name}`
    );
  } catch (err) {
    console.log(`Error while connecting to database: ${err}`);
    process.exit(0);
  }
};