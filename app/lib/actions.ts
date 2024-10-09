'use server';
export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

// Define the schema for form data validation
const FormSchema = z.object({
    id: z.string().optional(),   // 'id' is optional for creation or editing
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',

    }),      // 'customerId' is required

    amount: z.coerce.number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),   // Coerce 'amount' to a number

    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),   // Restrict 'status' to two possible values
    date: z.string(), // 'date' is optional
});

// Schema for creating an invoice (omit 'id' and 'date')
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// Function to create a new invoice
export async function createInvoice(prevState: State, formData: FormData) {
    try {
        // Extract and validate the form data using Zod
        const validatedFields = CreateInvoice.safeParse({
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status'),
        });
        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Missing Fields. Failed to Create Invoice.',
            };
        }

        // Convert the amount to cents for database storage
        const { customerId, amount, status } = validatedFields.data;
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
    } catch (error) {
        console.error('Error creating invoice:', error);
        return { message: 'Database Error: Failed to Create Invoice.' };
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

// Function to update an existing invoice
export async function updateInvoice(id: string, formData: FormData) {
    try {
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
    } catch (error) {
        console.error('Error updating invoice:', error);
        return { message: 'Database Error: Failed to Update Invoice.' };
    }
}

// Function to delete an invoice
export async function deleteInvoice(id: string) {
    try {
        await sql`
            DELETE FROM invoices
            WHERE id = ${id}
        `;
        revalidatePath('/dashboard/invoices');
        return { message: 'Deleted Invoice' };
    } catch (error) {
        console.error('Error deleting invoice:', error);
        throw error; // Rethrow the error to trigger the Error Boundary
    }
}
