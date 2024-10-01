'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Define the schema for the form data
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),  // Coerce the amount to a number
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

// Omit `id` and `date` when creating a new invoice
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// Define the `createInvoice` function
export async function createInvoice(formData: FormData) {
    // Parse and validate the formData using the CreateInvoice schema
    const rawFormData = {
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    };

    const { customerId, amount, status } = CreateInvoice.parse(rawFormData);

    // Convert amount to cents
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

    // Log the formData and the amount in cents for testing
    console.log('Raw Form Data:', rawFormData);
    console.log('Amount in cents:', amountInCents);
}

// Omit `date` when updating an existing invoice
const UpdateInvoice = FormSchema.omit({ date: true });

// Define the `updateInvoice` function
export async function updateInvoice(id: string, formData: FormData) {
    // Parse and validate the formData using the UpdateInvoice schema
    const { customerId, amount, status } = UpdateInvoice.parse({
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

    // Revalidate the path and redirect
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

    // Log the updated data for debugging
    console.log('Updated invoice data:', { id, customerId, amountInCents, status });
}
