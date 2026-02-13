'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Download, ExternalLink, Calendar, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Invoice {
  id: string;
  number?: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
  hosted_invoice_url?: string;
  pdf_url?: string;
}

interface SubscriptionInfo {
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface InvoiceHistoryProps {
  hasActiveSubscription: boolean;
  primaryColor: string;
  secondaryColor: string;
}

export function InvoiceHistory({ hasActiveSubscription, primaryColor, secondaryColor }: InvoiceHistoryProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasActiveSubscription) {
      fetchInvoices();
    }
  }, [hasActiveSubscription]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/invoices');
      const data = await response.json();

      if (response.ok) {
        setInvoices(data.invoices || []);
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasActiveSubscription) {
    return null;
  }

  const statusColors = {
    paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    open: 'bg-amber-100 text-amber-700 border-amber-200',
    void: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const statusLabels = {
    paid: 'Pagada',
    open: 'Pendiente',
    void: 'Anulada',
  };

  const nextBillingDate = subscription?.current_period_end
    ? format(new Date(subscription.current_period_end), 'dd MMM yyyy', { locale: es })
    : '-';

  return (
    <Card className="rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <CreditCard className="h-5 w-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Facturas y Pagos</h3>
              <p className="text-sm text-slate-500">
                {invoices.length} {invoices.length === 1 ? 'factura' : 'facturas'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-5">
        {/* Next Billing */}
        {subscription && !subscription.cancel_at_period_end && (
          <div
            className="mb-4 p-4 rounded-xl flex items-center justify-between"
            style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}30` }}
          >
            <div>
              <p className="text-sm text-slate-600">Próximo cobro</p>
              <p className="text-xl font-bold text-slate-900">{nextBillingDate}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600">
                Activo
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No hay facturas disponibles
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono font-semibold text-slate-900">
                      {invoice.currency} {invoice.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {invoice.number || `Factura ${invoice.id.slice(0, 8)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(invoice.created), 'dd MMM yyyy', { locale: es })}
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status as keyof typeof statusColors]}`}
                  >
                    {statusLabels[invoice.status as keyof typeof statusLabels] || invoice.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {invoice.hosted_invoice_url && (
                    <a
                      href={invoice.hosted_invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Ver en Stripe"
                    >
                      <ExternalLink className="h-4 w-4 text-slate-500" />
                    </a>
                  )}
                  {invoice.pdf_url && (
                    <a
                      href={invoice.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Descargar PDF"
                    >
                      <Download className="h-4 w-4 text-slate-500" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
