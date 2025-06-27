"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var app = (0, express_1.default)();
var port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.get('/', function (req, res) {
    res.send('Welcome to the Calculator API!');
});
app.get('/health', function (req, res) {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use(function (err, req, res, next) {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
    });
});
app.listen(port, function () {
    console.log("Calculator API running on port ".concat(port));
    console.log("Health check: http://localhost:".concat(port, "/health"));
});
