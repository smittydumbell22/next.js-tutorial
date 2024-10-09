import { Metadata } from 'next';

// Define metadata for the Customers page
export const metadata: Metadata = {
  title: 'Customers | Acme Dashboard',
  description: 'View and manage your customers in the Acme Dashboard.',
};

export default function Page() {
  return <p>Customers Page</p>;
}
