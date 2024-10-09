import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// Export metadata specific to this page
export const metadata: Metadata = {
  title: 'Edit Invoice | Acme Dashboard',
  description: 'Edit the selected invoice in the Acme Dashboard.',
};

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;

  // Fetch invoice and customers data concurrently
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);

  // If invoice is not found, show a 404 page
  if (!invoice) {
    notFound();
  }

  return (
    <main>
      {/* Breadcrumb navigation for user context */}
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          { label: 'Edit Invoice', href: `/dashboard/invoices/${id}/edit`, active: true },
        ]}
      />

      {/* Edit Invoice form populated with invoice and customers data */}
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}
