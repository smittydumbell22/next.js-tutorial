import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';
import { fetchLatestInvoices } from '@/app/lib/data';

export default async function LatestInvoices() {
  const latestInvoices = await fetchLatestInvoices();

  if (!latestInvoices || latestInvoices.length === 0) {
    return <p className="mt-4 text-gray-400">No invoices available.</p>;
  }

  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Latest Invoices
      </h2>
      <ul className="space-y-4">
        {latestInvoices.map((invoice) => (
          <li key={invoice.id} className="flex items-center justify-between p-4 bg-white rounded-md shadow-sm">
            <div className="flex items-center">
              <Image src={invoice.image_url} alt={invoice.name} width={40} height={40} className="rounded-full" />
              <div className="ml-4">
                <h3 className="font-semibold">{invoice.name}</h3>
                <p className="text-gray-600">{invoice.email}</p>
              </div>
            </div>
            <span className="text-gray-800 font-bold">{invoice.amount}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <ArrowPathIcon className="h-5 w-5 text-gray-500 animate-spin" />
      </div>
    </div>
  );
}
