const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Form = require('./models/form.model.js')

router.post('/add', async (req, res) => {
    try {
        const { title } = req.body;
        const existingForm = await Form.findOne({ title });
        if (existingForm) {
            return res.status(400).json({ message: 'Title already exists' });
        }
        const form = new Form(req.body);
        await form.save();
        res.status(201).json(form);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all forms
router.get('/getall', async (req, res) => {
    try {
        const forms = await Form.find();
        res.json(forms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single form by ID
router.get('/getbyid/:id', async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ message: 'Form not found' });
        res.json(form);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a form
router.put('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id
        const updatedForm = await Form.findByIdAndUpdate(id, req.body, {
            new: true
        });
        res.json(updatedForm);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a form
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Form ID' });
        }

        const form = await Form.findById(id);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        await Form.findByIdAndDelete(id);
        res.json({ message: 'Form deleted successfully' });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;