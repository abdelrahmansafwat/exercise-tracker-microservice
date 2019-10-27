require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });

var userSchema = new Schema({
    username: { type: String, required: true },
});

var userModel = mongoose.model("userModel", userSchema);

module.exports = userModel;