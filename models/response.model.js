// models/FormResponse.js
const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
    fieldLabel: String,
    response: mongoose.Schema.Types.Mixed  // could be string, array, etc.
});

const formResponseSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Form",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    answers: [answerSchema],
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("FormResponse", formResponseSchema);
