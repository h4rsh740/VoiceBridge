const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    trackingId: {
        type: String,
        required: true,
        unique: true
    },
    complaintText: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true,
        enum: ['Electricity', 'Roads', 'Sanitation', 'Water', 'General']
    },
    priority: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    status: {
        type: String,
        required: true,
        enum: ['registered', 'assigned', 'inspection', 'repair', 'resolved'],
        default: 'registered'
    },
    location: {
        type: String,
        default: '28.6139, 77.2090'
    },
    lat: {
        type: Number,
        default: 28.6139
    },
    lng: {
        type: Number,
        default: 77.2090
    },
    address: {
        type: String,
        default: 'NCR Municipal Area'
    },
    photo: {
        type: String
    },
    language: {
        type: String,
        default: 'en-IN'
    },
    solution: {
        type: String
    },
    eta: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Complaint', complaintSchema);
