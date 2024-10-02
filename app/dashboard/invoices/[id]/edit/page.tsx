import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { sql } from '@vercel/postgres';
import { fetchCustomers } from '@/app/lib/data';

export default async function Page({ params }: { params: { id: string } }) {
  const invoiceId = params.id;

  // Use Promise.all to fetch invoice and customers data concurrently
  const [invoice, customers] = await Promise.all([
    sql`SELECT * FROM invoices WHERE id = ${invoiceId}`.then(res => res.rows[0]),
    fetchCustomers(),  // Fetch customer list
  ]);

  return (
    <main>
      {/* Breadcrumb navigation */}
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${invoiceId}/edit`,
            active: true,
          },
        ]}
      />

      {/* Edit Invoice form with invoice and customers data */}
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}
