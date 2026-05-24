const Complaint = require('../models/Complaint');

exports.createComplaint = async (req, res) => {
    try {
        const { complaintText, department, priority, location, solution, eta, lat, lng, address, photo, language } = req.body;
        const trackingId = 'VB-' + Math.floor(1000 + Math.random() * 9000);
        
        const complaint = new Complaint({
            trackingId,
            complaintText,
            department,
            priority,
            location,
            solution,
            eta,
            lat,
            lng,
            address,
            photo,
            language
        });

        await complaint.save();
        res.status(201).json(complaint);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getComplaintByTrackingId = async (req, res) => {
    try {
        const complaint = await Complaint.findOne({ trackingId: req.params.id });
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(complaint);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteComplaint = async (req, res) => {
    try {
        await Complaint.findByIdAndDelete(req.params.id);
        res.json({ message: 'Complaint deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
