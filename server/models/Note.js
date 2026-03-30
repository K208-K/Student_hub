const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  subject: String,
  type: String,
  semester: Number,
  description: String,
  fileName: String,
  filePath: String
}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);