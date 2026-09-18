import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentRecord } from '../../types';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Check,
  X,
  FileImage,
  Filter,
} from 'lucide-react';

export const FeesTab: React.FC = () => {
  const { payments, students, courses, verifyPayment, rejectPayment } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [inspectedPayment, setInspectedPayment] = useState<PaymentRecord | null>(null);

  const filteredPayments = payments.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const handleVerify = (paymentId: string) => {
    verifyPayment(paymentId);
    setInspectedPayment(null);
  };

  const handleReject = (paymentId: string) => {
    const reason = prompt('Reason for rejection:', 'Transaction ID not matching bank statement');
    if (reason !== null) {
      rejectPayment(paymentId, reason);
      setInspectedPayment(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Fee Verification Desk</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manual receipt inspection workflow: verify bank transfers, UPI transactions, and update student fee statuses.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['pending', 'verified', 'rejected', 'all'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st} {st === 'pending' && `(${payments.filter((p) => p.status === 'pending').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-start">Student Details</th>
                <th className="py-3.5 px-4 text-start">Course</th>
                <th className="py-3.5 px-4 text-start">Amount & Method</th>
                <th className="py-3.5 px-4 text-start">Reference / Trx ID</th>
                <th className="py-3.5 px-4 text-start">Date</th>
                <th className="py-3.5 px-4 text-center">Receipt</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No payment submissions match this filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const student = students.find((s) => s.id === p.studentId);
                  const course = courses.find((c) => c.id === p.courseId);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-blue-700">{student?.studentId}</div>
                        <div className="font-bold text-slate-900">{student?.fullName || p.studentId}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{course?.name}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 text-sm">₹{p.amount}</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {p.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {p.transactionId}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {p.paymentDate}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {p.screenshotUrl ? (
                          <button
                            type="button"
                            onClick={() => setInspectedPayment(p)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                          >
                            <FileImage className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">No File</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {p.status === 'verified' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {p.status === 'rejected' && <XCircle className="w-3 h-3 text-red-600" />}
                          {p.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                          <span className="capitalize">{p.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status === 'pending' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleVerify(p.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs"
                                title="Approve & Mark Paid"
                              >
                                <Check className="w-3 h-3" />
                                <span>Verify</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(p.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setInspectedPayment(p)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                              title="Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Receipt Inspection Modal */}
      {inspectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-400 font-bold uppercase">Receipt Inspection</span>
                <h4 className="text-lg font-bold">Transaction Reference</h4>
                <p className="text-xs text-slate-400 font-mono">{inspectedPayment.transactionId}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedPayment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Amount Submitted</span>
                  <span className="text-base font-extrabold text-blue-900">₹{inspectedPayment.amount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Payment Method</span>
                  <span className="font-bold text-slate-800">{inspectedPayment.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Payment Date</span>
                  <span className="font-bold text-slate-800">{inspectedPayment.paymentDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Current Status</span>
                  <span className="font-bold uppercase text-blue-700">{inspectedPayment.status}</span>
                </div>
              </div>

              {inspectedPayment.note && (
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                  <span className="text-blue-700 font-bold block mb-0.5">Student's Note:</span>
                  <p className="text-slate-700">{inspectedPayment.note}</p>
                </div>
              )}

              {/* Receipt Image Preview */}
              <div>
                <span className="font-bold text-slate-900 block mb-2">Uploaded Bank / UPI Receipt:</span>
                {inspectedPayment.screenshotUrl ? (
                  <div className="rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 max-h-64 flex items-center justify-center">
                    <img
                      src={inspectedPayment.screenshotUrl}
                      alt="Payment receipt"
                      className="max-h-64 object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    No screenshot provided
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {inspectedPayment.status === 'pending' ? (
                <div className="flex items-center gap-2 w-full justify-end">
                  <button
                    type="button"
                    onClick={() => handleReject(inspectedPayment.id)}
                    className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs"
                  >
                    Reject Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerify(inspectedPayment.id)}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                  >
                    Approve & Verify (Mark Paid)
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setInspectedPayment(null)}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs ms-auto"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
