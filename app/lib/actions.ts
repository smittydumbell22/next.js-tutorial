'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Define the schema for form data validation
const FormSchema = z.object({
    id: z.string().optional(),   // 'id' is optional for creation or editing
    customerId: z.string(),      // 'customerId' is required
    amount: z.coerce.number(),   // Coerce 'amount' to a number
    status: z.enum(['pending', 'paid']),   // Restrict 'status' to two possible values
    date: z.string().optional(), // 'date' is optional
});

// Schema for creating an invoice (omit 'id' and 'date')
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// Function to create a new invoice
export async function createInvoice(formData: FormData) {
    // Extract and validate the form data using Zod
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // Convert the amount to cents for database storage
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0]; // Current date

    // Insert the new invoice into the database
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    // Revalidate the invoices path and redirect
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

    console.log('Created invoice:', { customerId, amountInCents, status });
}

// Function to update an existing invoice
export async function updateInvoice(id: string, formData: FormData) {
    // Use Zod to parse and validate the form data, omitting 'date' field for updates
    const { customerId, amount, status } = FormSchema.omit({ date: true }).parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // Convert amount to cents for consistency
    const amountInCents = amount * 100;

    // Execute the SQL update query
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
    `;

    // Revalidate and redirect to the invoices page
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

    console.log('Updated invoice:', { id, customerId, amountInCents, status });
}

// Function to delete an invoice
export async function deleteInvoice(id: string) {
    // Execute the SQL delete query
    await sql`
        DELETE FROM invoices
        WHERE id = ${id}
    `;

    // Revalidate and redirect to the invoices page
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

    console.log('Deleted invoice with id:', id);
}
