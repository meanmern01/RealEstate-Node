const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
  {
    designerId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    client_firstname: { type: String, required: true },
    client_lastname: { type: String, required: true },
    client_email: {
      type: String,
      required: true,
      //   unique: true,
    },
    projectRooms: {
      room: String,
      budget: String,
      completed: { type: Boolean, default: false },
    },

    // desiredCompletionDate: { type: String, default: "any" },
    zip: { type: String, required: true },
    state: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Projects = mongoose.model("project", projectSchema);
module.exports = Projects;
