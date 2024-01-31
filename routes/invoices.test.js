process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testInvoice;
beforeEach(async () => {
    await db.query(`INSERT INTO companies (code, name, description) VALUES ('test', 'Test Company', 'Company for testing') RETURNING  code, name, description`);
    const result = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ('test', 100, true, '2024-01-29', '2024-01-29') RETURNING *`);
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

// describe("GET /invoices/:code", () => {
//     test("Gets a single company", async () => {
//         const res = await request(app).get(`/invoices/${testCompany.code}`)
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({ company: testCompany })
//     })
//     test("Responds with 404 for invalid code", async () => {
//         const res = await request(app).get(`/invoices/0`)
//         expect(res.statusCode).toBe(404);
//     })
// })

// describe("POST /invoices", () => {
//     test("Creates a single company", async () => {
//         const res = await request(app).post('/invoices').send({ code: 'amzn', name: 'Amazon', description: 'this is amazon' });
//         expect(res.statusCode).toBe(201);
//         expect(res.body).toEqual({
//             company: { code: 'amzn', name: 'Amazon', description: 'this is amazon' }
//         })
//     })
// })

// describe("PATCH /invoices/:code", () => {
//     test("Updates a single company", async () => {
//         const res = await request(app)
//             .patch(`/invoices/${testCompany.code}`)
//             .send({ code: 'tst', name: 'Amazon', description: 'this is amazon' });
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({
//             company: { code: 'tst', name: 'Amazon', description: 'this is amazon' }
//         });
//     })
// })

// describe("DELETE /invoices/:code", () => {
//     test("Deletes a single company", async () => {
//         const res = await request(app).delete(`/invoices/${testCompany.code}`);
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({ msg: 'DELETED!' })
//     })
// })