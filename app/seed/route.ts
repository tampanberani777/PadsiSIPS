import { pool } from '@/app/lib/data';
import bcrypt from 'bcrypt';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

async function seedUsers() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `);

    // Insert data into the "users" table
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return pool.query(
          `
          INSERT INTO users (id, name, email, password)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE id=id
          `,
          [user.id, user.name, user.email, hashedPassword]
        );
      }),
    );

    console.log(`Seeded ${insertedUsers.length} users`);
    return insertedUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedCustomers() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL
      )
    `);

    const insertedCustomers = await Promise.all(
      customers.map((customer) =>
        pool.query(
          `
          INSERT INTO customers (id, name, email, image_url)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE id=id
          `,
          [customer.id, customer.name, customer.email, customer.image_url]
        ),
      ),
    );

    console.log(`Seeded ${insertedCustomers.length} customers`);
    return insertedCustomers;
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
}

async function seedInvoices() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(36) PRIMARY KEY,
        customer_id VARCHAR(36) NOT NULL,
        amount INT NOT NULL,
        status VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);

    const insertedInvoices = await Promise.all(
      invoices.map((invoice) =>
        pool.query(
          `
          INSERT INTO invoices (id, customer_id, amount, status, date)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE id=id
          `,
          [
            invoice.id,
            invoice.customer_id,
            invoice.amount,
            invoice.status,
            invoice.date,
          ]
        ),
      ),
    );

    console.log(`Seeded ${insertedInvoices.length} invoices`);
    return insertedInvoices;
  } catch (error) {
    console.error('Error seeding invoices:', error);
    throw error;
  }
}

async function seedRevenue() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS revenue (
        month VARCHAR(4) PRIMARY KEY,
        revenue INT NOT NULL
      )
    `);

    const insertedRevenue = await Promise.all(
      revenue.map((rev) =>
        pool.query(
          `
          INSERT INTO revenue (month, revenue)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE revenue = ?
          `,
          [rev.month, rev.revenue, rev.revenue]
        ),
      ),
    );

    console.log(`Seeded ${insertedRevenue.length} revenue`);
    return insertedRevenue;
  } catch (error) {
    console.error('Error seeding revenue:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      
      await seedUsers();
      await seedCustomers();
      await seedInvoices();
      await seedRevenue();
      
      await conn.commit();
      
      return Response.json({ message: 'Database seeded successfully' }, { status: 200 });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    return Response.json(
      { message: 'Database seed failed', error: (error as Error).message },
      { status: 500 }
    );
  }
}
