process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;

beforeEach(async () => {
    // Clear companies table
    // await db.query(`DELETE FROM companies`);

    // // Check if the company with the unique name already exists
    // const existingCompany = await db.query(`
    //     SELECT * FROM companies
    //     WHERE name = 'Unique Test Company'
    // `);

    // Insert a unique company if it doesn't exist
    // if (existingCompany.rows.length === 0) {
    //     const result = await db.query(`
    //         INSERT INTO companies (code, name, description)
    //         VALUES ('tst', 'Unique Test Company', 'Company for testing')
    //         RETURNING code, name, description
    //     `);
    //     testCompany = result.rows[0];
    // }
    const result = await db.query(`
            INSERT INTO companies (code, name, description)
            VALUES ('tst', 'Unique Test Company', 'Company for testing')
            RETURNING code, name, description
        `);
    testCompany = result.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
    await db.end()
})

describe("GET /companies", () => {
    test("Get a list with all companies", async () => {
        const res = await request(app).get('/companies')
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [testCompany] })
    })
})

describe("GET /companies/:code", () => {
    test("Gets a single company", async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ company: testCompany })
    })
    // test("Responds with 404 for invalid code", async () => {
    //     const res = await request(app).get(`/companies/0`)
    //     expect(res.statusCode).toBe(404);
    // })
})

describe("POST /companies", () => {
    test("Creates a single company", async () => {
        const res = await request(app).post('/companies').send({ code: 'amzn', name: 'Amazon', description: 'this is amazon' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            company: { code: 'amzn', name: 'Amazon', description: 'this is amazon' }
        })
    })
})

describe("PATCH /companies/:code", () => {
    test("Updates a single company", async () => {
        const res = await request(app)
            .patch(`/companies/${testCompany.code}`)
            .send({ code: 'tst', name: 'Amazon', description: 'this is amazon' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: { code: 'tst', name: 'Amazon', description: 'this is amazon' }
        });
    })
})

describe("DELETE /companies/:code", () => {
    test("Deletes a single company", async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ msg: 'DELETED!' })
    })
})