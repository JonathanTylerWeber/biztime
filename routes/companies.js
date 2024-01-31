const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const slugify = require('slugify');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows })
    } catch (e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query('SELECT * FROM companies WHERE code = $1', [code]);

        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }

        // Fetch associated industries
        const industries = await db.query('SELECT industry_code FROM company_industries WHERE company_code = $1', [code]);
        results.rows[0].industries = industries.rows.map(row => row.industry_code);

        return res.json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description, industry_code } = req.body;
        const newCode = slugify(code);

        const results = await db.query('INSERT INTO companies (code, name, description, industry_code) VALUES ($1, $2, $3, $4) RETURNING *', [newCode, name, description, industry_code]);
        return res.status(201).json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.patch('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description, industry_code } = req.body;
        const results = await db.query('UPDATE companies SET name=$1, description=$2, industry_code=$3 WHERE code=$4 RETURNING *', [name, description, industry_code, code]);

        if (results.rows.length === 0) {
            throw new ExpressError(`Can't update company with code of ${code}`, 404);
        }

        return res.json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        const results = await db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
        return res.send({ msg: "DELETED!" })
    } catch (e) {
        return next(e)
    }
})




module.exports = router;