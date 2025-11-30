import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TicketCategoryDetailModal({
  isOpen,
  onClose,
  ticket,
  formatRupiah,
  formatDateTime,
  formatDescriptionWithNewlines,
}) {
  return (
    <AnimatePresence>
      {isOpen && ticket && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white w-full sm:max-w-2xl sm:rounded-xl rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h3 className="text-base sm:text-xl font-bold text-gray-900 truncate pr-2">
                Detail Tiket - {ticket.type}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Ticket Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <h4 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                      {ticket.type}
                    </h4>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-700">
                      {formatRupiah(ticket.price)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ticket.stock === 0 && (
                      <span className="bg-red-100 text-red-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold border border-red-200">
                        HABIS
                      </span>
                    )}
                    {ticket.stock > 0 && ticket.stock <= 10 && (
                      <span className="bg-orange-100 text-orange-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold border border-orange-200">
                        HAMPIR HABIS
                      </span>
                    )}
                    {ticket.stock > 10 && (
                      <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold border border-green-200">
                        TERSEDIA
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Ticket Description */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                <h5 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                  Deskripsi Tiket
                </h5>
                <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed">
                  {formatDescriptionWithNewlines(ticket.desc)}
                </div>
              </div>

              {/* Ticket Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                  <h5 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Informasi Stok
                  </h5>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-600">Kuota Total</span>
                      <span className="font-semibold text-gray-900">
                        {ticket.quota}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-600">Tiket Terjual</span>
                      <span className="font-semibold text-green-600">
                        {ticket.sold}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-600">Stok Tersedia</span>
                      <span className="font-semibold text-blue-600">
                        {ticket.stock}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                  <h5 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Periode Tiket
                  </h5>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Tanggal Mulai</p>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">
                        {ticket.date_time_start
                          ? formatDateTime(ticket.date_time_start)
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
                        Tanggal Berakhir
                      </p>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">
                        {ticket.date_time_end
                          ? formatDateTime(ticket.date_time_end)
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}