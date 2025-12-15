// db + queries for MySQL (mysql2/promise)

import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

declare global {
  // biar pool tidak duplikat saat HMR di dev
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

export const pool =
  global._mysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    port: Number(process.env.DB_PORT || 3306),
    connectionLimit: 10,
    waitForConnections: true,
  });

if (process.env.NODE_ENV !== 'production') global._mysqlPool = pool;

/* ============ Helpers ============ */

// LIKE helper (case-insensitive secara aman di semua collation)
const like = (q: string) => `%${q}%`;

/* ============ Queries ============ */

export async function fetchRevenue() {
  try {
    const [rows] = await pool.query<(Revenue & RowDataPacket)[]>(
      'SELECT * FROM revenue',
    );
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const [rows] = await pool.query<(LatestInvoiceRaw & RowDataPacket)[]>(
      `
      SELECT i.amount, c.name, c.image_url, c.email, i.id
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      ORDER BY i.date DESC
      LIMIT 5
      `,
    );

    const latestInvoices = rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(Number(invoice.amount)),
    }));

    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    const [
      [invoiceCountRows],
      [customerCountRows],
      [invoiceStatusRows],
    ] = await Promise.all([
      pool.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM invoices'),
      pool.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM customers'),
      pool.query<RowDataPacket[]>(
        `
        SELECT
          COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END),0) AS paid,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END),0) AS pending
        FROM invoices
        `,
      ),
    ]);

    const numberOfInvoices = Number(invoiceCountRows[0].count ?? 0);
    const numberOfCustomers = Number(customerCountRows[0].count ?? 0);
    const totalPaidInvoices = formatCurrency(
      Number(invoiceStatusRows[0].paid ?? 0),
    );
    const totalPendingInvoices = formatCurrency(
      Number(invoiceStatusRows[0].pending ?? 0),
    );

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const [rows] = await pool.query<(InvoicesTable & RowDataPacket)[]>(
      `
      SELECT
        i.id,
        i.amount,
        i.date,
        i.status,
        c.name,
        c.email,
        c.image_url
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE
        LOWER(c.name)   LIKE LOWER(?) OR
        LOWER(c.email)  LIKE LOWER(?) OR
        CAST(i.amount AS CHAR) LIKE ? OR
        CAST(i.date   AS CHAR) LIKE ? OR
        LOWER(i.status) LIKE LOWER(?)
      ORDER BY i.date DESC
      LIMIT ? OFFSET ?
      `,
      [like(query), like(query), like(query), like(query), like(query), ITEMS_PER_PAGE, offset],
    );

    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) AS count
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE
        LOWER(c.name)   LIKE LOWER(?) OR
        LOWER(c.email)  LIKE LOWER(?) OR
        CAST(i.amount AS CHAR) LIKE ? OR
        CAST(i.date   AS CHAR) LIKE ? OR
        LOWER(i.status) LIKE LOWER(?)
      `,
      [like(query), like(query), like(query), like(query), like(query)],
    );

    const totalPages = Math.ceil(Number(rows[0].count ?? 0) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const [rows] = await pool.query<(InvoiceForm & RowDataPacket)[]>(
      `
      SELECT
        i.id,
        i.customer_id,
        i.amount,
        i.status
      FROM invoices i
      WHERE i.id = ?
      `,
      [id],
    );

    if (!rows.length) return undefined;

    const inv = rows[0];
    return {
      ...inv,
      // Convert amount from cents to dollars (ikuti logika awalmu)
      amount: Number(inv.amount) / 100,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const [rows] = await pool.query<(CustomerField & RowDataPacket)[]>(
      `
      SELECT id, name
      FROM customers
      ORDER BY name ASC
      `,
    );
    return rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const [rows] = await pool.query<(CustomersTableType & RowDataPacket)[]>(
      `
      SELECT
        c.id,
        c.name,
        c.email,
        c.image_url,
        COUNT(i.id)                                                   AS total_invoices,
        COALESCE(SUM(CASE WHEN i.status = 'pending' THEN i.amount END),0) AS total_pending,
        COALESCE(SUM(CASE WHEN i.status = 'paid'    THEN i.amount END),0) AS total_paid
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
      WHERE
        LOWER(c.name)  LIKE LOWER(?) OR
        LOWER(c.email) LIKE LOWER(?)
      GROUP BY c.id, c.name, c.email, c.image_url
      ORDER BY c.name ASC
      `,
      [like(query), like(query)],
    );

    const customers = rows.map((r) => ({
      ...r,
      total_pending: formatCurrency(Number(r.total_pending)),
      total_paid: formatCurrency(Number(r.total_paid)),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
