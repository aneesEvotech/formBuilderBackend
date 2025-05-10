const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'number', 'checkbox', 'multiple_choice', 'dropdown'],
    required: true
  },
  label: { type: String, required: true },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  options: [String], 
  order: { type: Number },
  name: { type: String }, 
});

const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fields: [FieldSchema],
  createdAt: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  }
});

module.exports = mongoose.model('Form', FormSchema);
