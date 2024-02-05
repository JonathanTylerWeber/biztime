process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testInvoice;


beforeEach(async () => {
    const existingCompany = await db.query(`
        SELECT * FROM companies WHERE code = 'test'
    `);

    if (existingCompany.rows.length === 0) {
        // If the company doesn't exist, insert it
        await db.query(`
            INSERT INTO companies (code, name, description)
            VALUES ('test', 'Unique Test Company', 'Company for testing')
            RETURNING code, name, description
        `);
    }
    const result = await db.query(`
        INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) 
        VALUES ('test', 100, true, '2018-01-01', '2024-02-05') 
        RETURNING *`);
    testInvoice = result.rows[0];
})

afterEach(async () => {
    await db.query(`DELETE FROM invoices`)
})

afterAll(async () => {
    await db.end()
})

describe("GET /invoices", () => {
    test("Get a list with all invoices", async () => {
        const res = await request(app).get('/invoices')
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ invoices: [testInvoice] })
    })
})

describe("GET /invoices/:id", () => {
    test("Gets a single invoice", async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ invoice: testInvoice })
    })
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).get(`/invoices/0`)
        expect(res.statusCode).toBe(404);
    })
})

describe("POST /invoices", () => {
    test("Creates a single invoice", async () => {
        const res = await request(app).post('/invoices').send({ comp_code: 'test', amt: 100, paid: true, add_date: '2018-01-01', paid_date: '2024-02-05' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            invoice: { comp_code: 'test', amt: 100, paid: true, add_date: '2018-01-01', paid_date: '2024-02-05' }
        })
    })
})

describe("PATCH /invoices/:id", () => {
    test("Updates a single invoice", async () => {
        const res = await request(app)
            .patch(`/invoices/${testInvoice.id}`)
            .send({ comp_code: 'test', amt: 100, paid: true, add_date: '2018-01-01', paid_date: '2024-02-05' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: { comp_code: 'test', amt: 100, paid: true, add_date: '2018-01-01', paid_date: '2024-02-05' }
        });
    })
})

describe("DELETE /invoices/:id", () => {
    test("Deletes a single invoice", async () => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ msg: 'DELETED!' })
    })
})