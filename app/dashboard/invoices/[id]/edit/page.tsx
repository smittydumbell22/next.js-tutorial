import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;

  // Use Promise.all to fetch invoice and customers data concurrently
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),  // Fetch customer list
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <main>
      {/* Breadcrumb navigation */}
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />

      {/* Edit Invoice form with invoice and customers data */}
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}
