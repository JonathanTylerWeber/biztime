-- Drop existing database if exists
DROP DATABASE IF EXISTS biztime;

-- Create new database
CREATE DATABASE biztime;

-- Connect to the new database
\c biztime;

-- Drop tables if they exist
DROP TABLE IF EXISTS company_industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS companies;

-- Create companies table
CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

-- Create industries table
CREATE TABLE industries (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE
);

-- Create invoices table
CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

-- Create company_industries table
CREATE TABLE company_industries (
    id serial PRIMARY KEY,
    company_code text REFERENCES companies(code) ON DELETE CASCADE,
    industry_code text REFERENCES industries(code) ON DELETE CASCADE
);



-- Insert data into industries
INSERT INTO industries (code, name)
VALUES 
    ('tech', 'Tech'),
    ('sales', 'Sales'),
    ('rsrch', 'Research');

-- Insert data into companies
INSERT INTO companies (code, name, description)
VALUES 
    ('apple', 'Apple Computer', 'Maker of OSX.'),
    ('ibm', 'IBM', 'Big blue.');

-- Insert data into invoices
INSERT INTO invoices (comp_code, amt, paid, paid_date)
VALUES 
    ('apple', 100, false, null),
    ('apple', 200, false, null),
    ('apple', 300, true, '2018-01-01'),
    ('ibm', 400, false, null);

-- Insert data into company_industries
INSERT INTO company_industries (company_code, industry_code)
VALUES 
    ('ibm', 'rsrch'),
    ('ibm', 'tech'),
    ('apple', 'tech'),
    ('apple', 'sales');
