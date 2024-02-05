const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

// Add an industry
router.post('/', async (req, res, next) => {
    try {
        const { code, name } = req.body;
        const results = await db.query('INSERT INTO industries (code, name) VALUES ($1, $2) RETURNING *', [code, name]);
        return res.status(201).json({ industry: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

// List all industries
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`
            SELECT i.code, i.name, (
                SELECT ARRAY(SELECT ci.company_code FROM company_industries ci WHERE ci.industry_code = i.code)
            ) as company_codes
            FROM industries i
        `);

        const industries = results.rows.map(row => ({
            code: row.code,
            name: row.name,
            companyCodes: row.company_codes || []
        }));

        return res.json({ industries });
    } catch (e) {
        return next(e);
    }
});

// Associating an industry to a company
router.post('/associate', async (req, res, next) => {
    try {
        const { industryCode, companyCode } = req.body;
        await db.query('INSERT INTO company_industries (company_code, industry_code) VALUES ($1, $2)', [companyCode, industryCode]);
        return res.json({ message: 'Industry associated with company successfully' });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
