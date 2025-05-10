const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Form = require("./models/form.model.js");
const FormResponse = require("./models/response.model.js");

router.post("/responsesubmit", async (req, res) => {
    try {
        const { formId, answers } = req.body;


        if (!mongoose.Types.ObjectId.isValid(formId)) {
            return res.status(400).json({ error: "Invalid form ID" });
        }

        const form = await Form.findById(formId);

        if (!form) {
            return res.status(404).json({ error: "Form not found" });
        }

        const response = new FormResponse({ formId, answers });
        await response.save();

        res.status(200).json({ message: "Response saved successfully" });
    } catch (err) {
        console.error("Error saving response:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});



router.get('/getformbyid/:id', async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ message: 'Form not found' });
        res.json(form);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get("/getallresponses/:id", async (req, res) => {
    try {
        // Find form responses based on formId (passed in URL params)
        const responses = await FormResponse.find({ formId: req.params.id });

        // Check if no responses were found
        if (!responses || responses.length === 0) {
            return res.status(404).json({ message: "No responses found for this form" });
        }

        res.json(responses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get("/getallresponseswithCount", async (req, res) => {
    try {
        const responseCounts = await FormResponse.aggregate([
            {
                $group: {
                    _id: "$formId",
                    responseCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "forms",
                    localField: "_id",
                    foreignField: "_id",
                    as: "form"
                }
            },
            {
                $unwind: "$form"
            },
            {
                $project: {
                    _id: 0,
                    formId: "$_id",
                    formTitle: "$form.title",
                    responseCount: 1
                }
            }
        ]);

        res.json(responseCounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
