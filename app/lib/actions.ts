'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Define the schema for the form data
const FormSchema = z.object({
    id: z.string().optional(),  // Make id optional for creation
    customerId: z.string(),
    amount: z.coerce.number(),  // Coerce the amount to a number
    status: z.enum(['pending', 'paid']),
    date: z.string().optional(), // Make date optional
});

// Function to create a new invoice
export async function createInvoice(formData: FormData) {
    // Extract values of form data
    const rawFormData = {
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    };
    
    // Log the raw form data for testing
    console.log('Raw Form Data:', rawFormData);

    // Parse and validate the formData using the schema
    const { customerId, amount, status } = FormSchema.omit({ id: true, date: true }).parse(rawFormData);

    // Convert amount to cents
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0]; // Get current date

    // Insert the new invoice into the database
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    // Revalidate the path and redirect to the invoices page
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

    // Log the amount in cents for testing
    console.log('Amount in cents:', amountInCents);
}

// Function to update an existing invoice
export async function updateInvoice(id: string, formData: FormData) {
    // Parse and validate the formData using the schema
    const { customerId, amount, status } = FormSchema.omit({ date: true }).parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    // Execute the SQL update statement
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
    `;

    // Revalidate the path and redirect to the invoices page
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

    // Log the updated data for debugging
    console.log('Updated invoice data:', { id, customerId, amountInCents, status });
}
