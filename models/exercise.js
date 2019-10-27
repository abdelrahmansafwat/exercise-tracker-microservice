require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });

var exercise = new Schema({
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, default: new Date() }
});

var exerciseSchema = new Schema({
    username: { type: String },
    userId: { type: String, required: true },
    log: [exercise]
});

var exerciseModel = mongoose.model("exerciseModel", exerciseSchema);

module.exports = exerciseModel;