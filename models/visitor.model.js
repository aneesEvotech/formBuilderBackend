const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
    {
        url: { type: String, require: true },
        ip: { type: String },
        browser: String,
        os: String,
        device: String,
        visitedAt: { type: Date, default: Date.now },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("Visitor", visitorSchema);