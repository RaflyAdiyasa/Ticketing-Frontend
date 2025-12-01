import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  MapPin,
  CalendarDays,
  Shapes,
  CheckCircle,
  XCircle,
  Clock,
  Scale,
  Building,
  FileText,
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Heart,
  Eye,
  Ticket,
  ChevronDown,
  ChevronUp,
  LogIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api, { eventAPI } from "../services/api";
import useNotification from "../hooks/useNotification";
import NotificationModal from "../components/NotificationModal";
import TicketCategoryDetailModal from "../components/TicketCategoryDetailModal";
import ImagePreviewModal from "../components/ImagePreviewModal";

const formatRupiah = (angka) => {
  if (angka === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

const formatDate = (dateStart, dateEnd) => {
  const start = new Date(dateStart);
  const end = new Date(dateEnd);

  const formatOptions = { day: "numeric", month: "short", year: "numeric" };
  const startFormatted = start.toLocaleDateString("id-ID", formatOptions);
  const endFormatted = end.toLocaleDateString("id-ID", formatOptions);

  if (startFormatted === endFormatted) {
    return startFormatted;
  }
  return `${startFormatted} - ${endFormatted}`;
};

const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDescriptionWithNewlines = (text) => {
  if (!text) return "";
  return text.split("\n").map((line, index) => (
    <span key={index}>
      {line}
      {index < text.split("\n").length - 1 && <br />}
    </span>
  ));
};

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 10000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
};

function StatusBadge({ status }) {
  const getStatusIcon = () => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "approved":
        return "Disetujui";
      case "rejected":
        return "Ditolak";
      case "pending":
        return "Menunggu Verifikasi";
      default:
        return status;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getStatusIcon()}
      <span className="font-semibold">{getStatusText()}</span>
    </div>
  );
}

function AdminVerificationSection({ onVerify, verifying }) {
  return (
    <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-xl">
      <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2 sm:mb-3">
        Verifikasi Event
      </h3>
      <p className="text-sm sm:text-base text-blue-700 mb-4">
        Sebagai admin, Anda dapat menyetujui atau menolak event ini.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          onClick={() => onVerify("reject")}
          disabled={verifying}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 text-sm sm:text-base"
        >
          <XCircle size={18} />
          Tolak Event
        </button>
        <button
          onClick={() => onVerify("approve")}
          disabled={verifying}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 text-sm sm:text-base"
        >
          <CheckCircle size={18} />
          Setujui Event
        </button>
      </div>
    </div>
  );
}

function VerificationModal({
  isOpen,
  onClose,
  action,
  eventName,
  comment,
  onCommentChange,
  onConfirm,
  verifying,
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.3,
        }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">
            Konfirmasi Verifikasi
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <p className="text-sm sm:text-base text-gray-700 mb-2">
            Anda akan{" "}
            <strong>{action === "approve" ? "menyetujui" : "menolak"}</strong>{" "}
            event:
          </p>
          <p className="font-semibold text-base sm:text-lg">{eventName}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Komentar Verifikasi{" "}
            {action === "reject" ? "(Wajib untuk penolakan)" : "(Opsional)"}:
          </label>
          <motion.textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder={`Berikan komentar ${
              action === "approve" ? "persetujuan" : "penolakan"
            }...`}
            required={action === "reject"}
            whileFocus={{
              scale: 1.01,
              transition: { duration: 0.2 },
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3"
        >
          <motion.button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
            disabled={verifying}
            whileHover={{ scale: verifying ? 1 : 1.02 }}
            whileTap={{ scale: verifying ? 1 : 0.98 }}
          >
            Batal
          </motion.button>
          <motion.button
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-lg text-white transition-colors font-medium text-sm sm:text-base ${
              action === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
            disabled={verifying || (action === "reject" && !comment.trim())}
            whileHover={{
              scale:
                verifying || (action === "reject" && !comment.trim())
                  ? 1
                  : 1.02,
            }}
            whileTap={{
              scale:
                verifying || (action === "reject" && !comment.trim())
                  ? 1
                  : 0.98,
            }}
          >
            {verifying ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Memproses...
              </motion.span>
            ) : action === "approve" ? (
              "Setujui"
            ) : (
              "Tolak"
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function TicketItem({
  ticket,
  index,
  showControls,
  onUpdateQty,
  onViewDetail,
  isEventEnded,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-1">
            <p className="font-bold text-base sm:text-lg lg:text-xl text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {ticket.type}
            </p>
            {ticket.stock === 0 && (
              <span className="bg-red-100 text-red-800 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold border border-red-200">
                HABIS
              </span>
            )}
            {ticket.stock > 0 && ticket.stock <= 10 && (
              <span className="bg-orange-100 text-orange-800 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold border border-orange-200">
                HAMPIR HABIS
              </span>
            )}
            {ticket.stock > 10 && (
              <span className="bg-green-100 text-green-800 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold border border-green-200">
                TERSEDIA
              </span>
            )}
          </div>

          {ticket.date_time_start && (
            <div className="text-2sm sm:text-2sm text-gray-700 space-y-0.5">
              <p>
                <span className="font-medium">Mulai:</span>{" "}
                {formatDateTime(ticket.date_time_start)}
              </p>
              <p>
                <span className="font-medium">Selesai:</span>{" "}
                {formatDateTime(ticket.date_time_end)}
              </p>
              {isEventEnded && (
                <p className="text-2xs text-red-600 font-medium">
                  Event ini sudah berakhir
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 sm:gap-3">
          <p
            className={`text-xl sm:text-2xl font-bold ${
              ticket.price === 0 ? "text-green-600" : "text-gray-900"
            }`}
          >
            {formatRupiah(ticket.price)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail(ticket);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium bg-purple-100 text-purple-600 hover:bg-purple-200 text-sm sm:text-base"
        >
          <Eye size={16} />
          Lihat Detail
        </button>

        {showControls && (
          <div className="flex items-center gap-4">
            {!isEventEnded && (
              <p className="text-sm text-gray-700 whitespace-nowrap">
                Tersisa: {ticket.stock} pcs
              </p>
            )}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-300 p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => onUpdateQty(index, -1)}
                  disabled={ticket.qty === 0 || isEventEnded}
                  className={`w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                    ticket.qty === 0 || isEventEnded
                      ? "opacity-30 cursor-not-allowed bg-gray-100 text-gray-400"
                      : "hover:bg-purple-50 hover:text-purple-600 bg-white text-gray-700 active:bg-purple-100"
                  } border border-transparent`}
                >
                  <Minus size={18} className="sm:w-4 sm:h-4" />
                </button>
                <span className="w-10 sm:w-8 text-center font-bold text-lg text-gray-900">
                  {ticket.qty}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQty(index, 1)}
                  className={`w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                    ticket.qty >= ticket.stock ||
                    ticket.stock === 0 ||
                    isEventEnded
                      ? "opacity-30 cursor-not-allowed bg-gray-100 text-gray-400"
                      : "hover:bg-purple-50 hover:text-purple-600 bg-white text-gray-700 active:bg-purple-100"
                  } border border-transparent`}
                  disabled={
                    ticket.qty >= ticket.stock ||
                    ticket.stock === 0 ||
                    isEventEnded
                  }
                >
                  <Plus size={18} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CartSummary({ tickets, totalHarga, onAddToCart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-lg p-4 sm:p-6 sticky top-4"
    >
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        Ringkasan Pembelian
      </h3>

      <div className="space-y-2 sm:space-y-3 mb-4">
        {tickets
          .filter((t) => t.qty > 0)
          .map((t) => (
            <div
              key={t.ticket_category_id}
              className="flex justify-between text-xs sm:text-sm bg-white rounded-lg p-2.5 sm:p-3 border border-gray-200"
            >
              <span className="text-gray-700 truncate mr-2">
                {t.type} × {t.qty}
              </span>
              <span className="font-medium text-gray-900 shrink-0">
                {formatRupiah(t.price * t.qty)}
              </span>
            </div>
          ))}
      </div>

      <div className="border-t border-blue-200 pt-3 sm:pt-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-base sm:text-lg font-semibold text-gray-900">
            Total
          </span>
          <span
            className={`text-xl sm:text-2xl font-bold ${
              totalHarga === 0 ? "text-green-600" : "text-blue-600"
            }`}
          >
            {formatRupiah(totalHarga)}
          </span>
        </div>
      </div>

      <motion.button
        onClick={onAddToCart}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 sm:py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-sm sm:text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
        Masukkan ke Keranjang
      </motion.button>
    </motion.div>
  );
}

function EventImageSection({ event, onImageClick }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-4">
      <div
        className="rounded-xl overflow-hidden shadow-lg aspect-square border border-gray-200 relative group cursor-pointer"
        onClick={() =>
          onImageClick(
            event.image ||
              "https://axistechindia.com/images/image%20not%20available.jpg",
            event.name,
            "square"
          )
        }
      >
        <img
          src={
            event.image ||
            "https://axistechindia.com/images/image%20not%20available.jpg"
          }
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src =
              "https://axistechindia.com/images/image%20not%20available.jpg";
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2 sm:p-3">
            <Eye className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 sm:hidden bg-black/50 rounded-full p-1.5">
          <Eye className="w-3 h-3 text-white" />
        </div>
      </div>

      {event.flyer && (
        <div
          className="rounded-xl overflow-hidden shadow-lg aspect-16/6 border border-gray-200 relative group cursor-pointer"
          onClick={() =>
            onImageClick(event.flyer, `Flyer ${event.name}`, "video")
          }
        >
          <img
            src={event.flyer}
            alt={`Flyer ${event.name}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2 sm:p-3">
              <Eye className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 sm:hidden bg-black/50 rounded-full p-1.5">
            <Eye className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}

function OrganizerInfo({ owner }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
        <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
          <Building className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        </div>
        Penyelenggara
      </h3>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 border-2 border-gray-300 bg-gray-200 flex items-center justify-center">
          {owner?.profile_pict ? (
            <img
              src={owner.profile_pict}
              alt={owner.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-semibold text-lg sm:text-xl"
            style={{
              display: owner?.profile_pict ? "none" : "flex",
            }}
          >
            {owner?.name?.charAt(0)?.toUpperCase() || "O"}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 truncate">
            {owner?.name || "Organizer"}
          </p>
          {owner?.organization && (
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {owner.organization}
            </p>
          )}
          {owner?.email && (
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">
              {owner.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ExpandableRules({ rules, maxLines = 5 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);

  useEffect(() => {
    if (!rules) return;
    const lineCount = rules.split("\n").length;
    const charCount = rules.length;
    setNeedsExpand(lineCount > maxLines || charCount > 300);
  }, [rules, maxLines]);

  if (!rules) return null;

  return (
    <div className="relative">
      <div
        className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700 leading-relaxed transition-all duration-300 ${
          !isExpanded && needsExpand
            ? "max-h-32 sm:max-h-40 overflow-hidden"
            : ""
        }`}
      >
        {formatDescriptionWithNewlines(rules)}
      </div>

      {needsExpand && !isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
      )}

      {needsExpand && (
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-medium text-sm sm:text-base transition-colors ${
            !isExpanded ? "relative -mt-2 sm:-mt-4" : "mt-3 sm:mt-4"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
              Sembunyikan
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              Lihat selengkapnya
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}

function LoginPrompt({ onLogin }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6"
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-700">
            Anda belum login. Untuk membeli tiket, silahkan login terlebih
            dahulu.
          </p>
          <button
            onClick={onLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <LogIn size={16} />
            Login Sekarang
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } =
    useNotification();

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEO, setIsEO] = useState(false);
  const [isRegularUser, setIsRegularUser] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationAction, setVerificationAction] = useState(null);
  const [approvalComment, setApprovalComment] = useState("");

  const [isLiked, setIsLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState({
    src: null,
    alt: null,
    aspectRatio: "square",
  });

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/event/${id}`);
        const eventData = response.data;

        setEvent(eventData);
        setTotalLikes(eventData.total_likes || 0);

        const formattedTickets =
          eventData.ticket_categories?.map((ticket) => ({
            ticket_category_id: ticket.ticket_category_id,
            type: ticket.name,
            desc: ticket.description || "Tiket masuk event",
            price: ticket.price,
            stock: ticket.quota - (ticket.sold || 0),
            quota: ticket.quota,
            sold: ticket.sold || 0,
            date_time_start: ticket.date_time_start,
            date_time_end: ticket.date_time_end,
            qty: 0,
          })) || [];

        setTickets(formattedTickets);
        checkUserRoleAndOwnership(eventData);
      } catch (err) {
        console.error("Error fetching event detail:", err);
        setError("Gagal memuat detail event");
        showNotification("Gagal memuat detail event", "Error", "error");
      } finally {
        setLoading(false);
      }
    };

    const checkUserRoleAndOwnership = (eventData) => {
      try {
        const token = sessionStorage.getItem("token");
        if (token) {
          setIsLoggedIn(true);
          const payload = JSON.parse(atob(token.split(".")[1]));
          const isEventOwner = payload.user_id === eventData.owner_id;
          const isAdminUser = payload.role === "admin";
          const isEOUser = payload.role === "organizer";

          setIsOwner(isEventOwner);
          setIsAdmin(isAdminUser);
          setIsEO(isEOUser);
          setIsRegularUser(
            payload.role === "user" &&
              !isEventOwner &&
              !isAdminUser &&
              !isEOUser
          );
        } else {
          setIsLoggedIn(false);
          setIsOwner(false);
          setIsAdmin(false);
          setIsEO(false);
          setIsRegularUser(false);
        }
      } catch (err) {
        console.error("Error checking user role:", err);
        setIsLoggedIn(false);
        setIsOwner(false);
        setIsAdmin(false);
        setIsEO(false);
        setIsRegularUser(false);
      }
    };

    if (id) {
      fetchEventDetail();
    }
  }, [id]);

  useEffect(() => {
    const fetchLikedStatus = async () => {
      if (!isLoggedIn || !isRegularUser || !id) return;

      try {
        const response = await eventAPI.getMyLikedEvents();
        const likedEventIds = (response.data?.liked_event || []).map(
          (e) => e.event_id
        );
        setIsLiked(likedEventIds.includes(id));
      } catch (err) {
        console.error("Error fetching liked status:", err);
      }
    };

    fetchLikedStatus();
  }, [isLoggedIn, isRegularUser, id]);

  const handleLikeEvent = async (e) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (!isRegularUser) {
      return;
    }

    if (likeLoading) return;

    setLikeLoading(true);

    const previousIsLiked = isLiked;
    const previousTotalLikes = totalLikes;

    setIsLiked(!isLiked);
    setTotalLikes((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));

    try {
      const response = await eventAPI.likeEvent(id);

      if (response.data?.event_total_like !== undefined) {
        setTotalLikes(response.data.event_total_like);
      }

      setEvent((prev) => ({
        ...prev,
        total_likes:
          response.data?.event_total_like ??
          (isLiked ? Math.max(0, prev.total_likes - 1) : prev.total_likes + 1),
      }));
    } catch (err) {
      console.error("Error toggling like:", err);
      setIsLiked(previousIsLiked);
      setTotalLikes(previousTotalLikes);
      showNotification("Gagal memproses like", "Error", "error");
    } finally {
      setLikeLoading(false);
    }
  };

  const updateQty = (index, delta) => {
    setTickets((prev) =>
      prev.map((t, i) => {
        if (i !== index) return t;
        const newQty = Math.min(Math.max(t.qty + delta, 0), t.stock);
        return { ...t, qty: newQty };
      })
    );
  };

  const handleAddToCart = async () => {
    try {
      const cartItems = tickets
        .filter((ticket) => ticket.qty > 0)
        .map((ticket) => ({
          ticket_category_id: ticket.ticket_category_id,
          quantity: ticket.qty,
        }));

      if (cartItems.length === 0) {
        showNotification(
          "Pilih setidaknya satu tiket",
          "Peringatan",
          "warning"
        );
        return;
      }

      const results = await Promise.allSettled(
        cartItems.map((item) => api.post("/api/cart", item))
      );

      const successfulItems = results.filter(
        (result) =>
          result.status === "fulfilled" &&
          (result.value.status === 200 || result.value.status === 201)
      );

      const failedItems = results.filter(
        (result) =>
          result.status === "rejected" ||
          (result.status === "fulfilled" &&
            result.value.status !== 200 &&
            result.value.status !== 201)
      );

      if (successfulItems.length > 0) {
        showNotification(
          `${successfulItems.length} tiket berhasil dimasukkan ke keranjang!`,
          "Sukses",
          "success"
        );
        setTickets((prev) => prev.map((t) => ({ ...t, qty: 0 })));

        if (failedItems.length === 0) {
          navigate("/keranjang");
        }
      }

      if (failedItems.length > 0) {
        const errorMessages = failedItems.map((item) => {
          if (item.status === "rejected") {
            return (
              item.reason?.response?.data?.error ||
              item.reason?.message ||
              "Error tidak diketahui"
            );
          } else {
            return item.value?.data?.error || `Status: ${item.value.status}`;
          }
        });

        showNotification(
          `${failedItems.length} tiket gagal ditambahkan: ${errorMessages.join(
            ", "
          )}`,
          "Peringatan",
          "warning"
        );
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.data?.error) {
        showNotification(
          `Gagal menambahkan tiket: ${error.response.data.error}`,
          "Error",
          "error"
        );
      } else {
        showNotification(
          "Gagal menambahkan tiket ke keranjang",
          "Error",
          "error"
        );
      }
    }
  };

  const handleVerifyEvent = async (action) => {
    try {
      setVerifying(true);

      const statusData = {
        status: action === "approve" ? "approved" : "rejected",
        approval_comment:
          approvalComment ||
          `Event ${action === "approve" ? "disetujui" : "ditolak"} oleh admin`,
      };

      await eventAPI.verifyEvent(id, statusData);

      showNotification(
        `Event berhasil ${action === "approve" ? "disetujui" : "ditolak"}!`,
        "Sukses",
        action === "approve" ? "success" : "warning"
      );

      setShowVerificationModal(false);
      setApprovalComment("");

      const refreshedResponse = await api.get(`/api/event/${id}`);
      setEvent(refreshedResponse.data);
    } catch (error) {
      console.error("Error verifying event:", error);
      showNotification("Gagal memverifikasi event", "Error", "error");
    } finally {
      setVerifying(false);
    }
  };

  const openVerificationModal = (action) => {
    setVerificationAction(action);
    setShowVerificationModal(true);
  };

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const closeTicketModal = () => {
    setShowTicketModal(false);
    setSelectedTicket(null);
  };

  const openImagePreview = (src, alt, aspectRatio) => {
    setPreviewImage({ src, alt, aspectRatio });
    setShowImagePreview(true);
  };

  const closeImagePreview = () => {
    setShowImagePreview(false);
    setPreviewImage({ src: null, alt: null, aspectRatio: "square" });
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-sm sm:text-base">
              Memuat detail event...
            </p>
          </div>
        </div>
        <NotificationModal
          message={notification.message}
          title={notification.title}
          type={notification.type}
          isOpen={notification.isOpen}
          onClose={hideNotification}
        />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen py-8">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center px-4">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-2">
              Gagal memuat event
            </h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              {error || "Event tidak ditemukan"}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Kembali
            </button>
          </div>
        </div>
        <NotificationModal
          message={notification.message}
          title={notification.title}
          type={notification.type}
          isOpen={notification.isOpen}
          onClose={hideNotification}
        />
      </div>
    );
  }

  const totalHarga = tickets.reduce(
    (sum, ticket) => sum + ticket.price * ticket.qty,
    0
  );
  const adaTiketDipilih = tickets.some((t) => t.qty > 0);

  const canEdit = isOwner || isAdmin;
  const canVerify = isAdmin && event.status === "pending";
  const canPurchase = isRegularUser;
  const showTicketControls = canPurchase;
  const showStatusInfo =
    isOwner || isAdmin || (isEO && event.status !== "approved");

  const isEventEnded = event.status === "ended";

  return (
    <div className="min-h-screen py-8 mt-30">
      <Navbar />

      <NotificationModal
        message={notification.message}
        title={notification.title}
        type={notification.type}
        isOpen={notification.isOpen}
        onClose={hideNotification}
      />

      <div className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Kembali
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-6">
                <div className="flex-1 w-full">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold leading-tight flex-1">
                      {event.name}
                    </h1>

                    <motion.button
                      onClick={handleLikeEvent}
                      disabled={likeLoading || !isRegularUser}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all shrink-0 ${
                        isLiked
                          ? "bg-pink-500 text-white hover:bg-pink-600"
                          : "bg-white/20 text-white hover:bg-white/30"
                      } ${
                        likeLoading || !isRegularUser
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      whileHover={{
                        scale: likeLoading || !isRegularUser ? 1 : 1.05,
                      }}
                      whileTap={{
                        scale: likeLoading || !isRegularUser ? 1 : 0.95,
                      }}
                    >
                      <Heart
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                          isLiked ? "fill-current" : ""
                        } ${likeLoading ? "animate-pulse" : ""}`}
                      />
                      <span className="font-semibold text-sm sm:text-base">
                        {formatNumber(totalLikes)}
                      </span>
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-white/20 p-2 rounded-lg shrink-0">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm text-blue-100">
                          Lokasi
                        </p>
                        <p className="text-white font-semibold text-sm sm:text-base truncate">
                          {event.venue}, {event.district}
                        </p>
                        <p className="text-xs text-blue-100 truncate">
                          {event.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-white/20 p-2 rounded-lg shrink-0">
                        <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm text-blue-100">
                          Tanggal
                        </p>
                        <p className="text-white font-semibold text-sm sm:text-base">
                          {formatDate(event.date_start, event.date_end)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 sm:col-span-2 lg:col-span-1">
                      <div className="bg-white/20 p-2 rounded-lg shrink-0">
                        <Shapes className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm text-blue-100">
                          Kategori
                        </p>
                        <p className="text-white font-semibold text-sm sm:text-base">
                          {event.category}{" "}
                          {event.child_category && `- ${event.child_category}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              {showStatusInfo && (
                <div
                  className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 ${
                    event.status === "pending"
                      ? "bg-yellow-50 border border-yellow-200"
                      : event.status === "rejected"
                      ? "bg-red-50 border border-red-200"
                      : event.status === "approved"
                      ? "bg-green-50 border border-green-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <StatusBadge status={event.status} />
                  <div className="flex-1">
                    {event.approval_comment && (
                      <p className="text-gray-600 text-sm sm:text-base">
                        Komentar: {event.approval_comment}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {canVerify && (
                <AdminVerificationSection
                  onVerify={openVerificationModal}
                  verifying={verifying}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-first lg:order-last">
                  <EventImageSection
                    event={event}
                    onImageClick={openImagePreview}
                  />

                  <OrganizerInfo owner={event.owner} />

                  {!isLoggedIn && <LoginPrompt onLogin={handleLoginRedirect} />}
                </div>

                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-100">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                        <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        Tentang Event
                      </h2>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700 leading-relaxed">
                        {formatDescriptionWithNewlines(event.description)}
                      </div>
                    </div>
                  </div>

                  {event.rules && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-orange-100">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                          <div className="bg-orange-600 p-1.5 sm:p-2 rounded-lg">
                            <Scale className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                          </div>
                          Peraturan Event
                        </h2>
                      </div>
                      <div className="p-4 sm:p-6">
                        <ExpandableRules rules={event.rules} maxLines={5} />
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-purple-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-100">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                        <div className="bg-purple-600 p-1.5 sm:p-2 rounded-lg">
                          <Ticket className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        Kategori Tiket
                      </h2>
                    </div>

                    {tickets.length === 0 ? (
                      <div className="text-center py-10 sm:py-16 text-gray-500 px-4">
                        <div className="max-w-md mx-auto">
                          <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full flex items-center justify-center bg-purple-100">
                            <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
                          </div>
                          <p className="text-base sm:text-lg font-medium mb-2">
                            Belum ada tiket tersedia
                          </p>
                          <p className="text-gray-400 mb-4 text-sm sm:text-base">
                            Tiket untuk event ini belum tersedia
                          </p>
                          {isOwner && (
                            <button
                              onClick={() => navigate(`/edit-event/${id}`)}
                              className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
                            >
                              Tambah Tiket
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 sm:p-6 space-y-4">
                        {tickets.map((ticket, index) => (
                          <TicketItem
                            key={ticket.ticket_category_id}
                            ticket={ticket}
                            index={index}
                            showControls={showTicketControls}
                            onUpdateQty={updateQty}
                            onViewDetail={openTicketModal}
                            isEventEnded={isEventEnded}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {adaTiketDipilih && canPurchase && !isEventEnded && (
                      <CartSummary
                        tickets={tickets}
                        totalHarga={totalHarga}
                        onAddToCart={handleAddToCart}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setApprovalComment("");
        }}
        action={verificationAction}
        eventName={event.name}
        comment={approvalComment}
        onCommentChange={setApprovalComment}
        onConfirm={() => handleVerifyEvent(verificationAction)}
        verifying={verifying}
      />

      <TicketCategoryDetailModal
        isOpen={showTicketModal}
        onClose={closeTicketModal}
        ticket={selectedTicket}
        formatRupiah={formatRupiah}
        formatDateTime={formatDateTime}
        formatDescriptionWithNewlines={formatDescriptionWithNewlines}
      />

      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={closeImagePreview}
        imageSrc={previewImage.src}
        imageAlt={previewImage.alt}
        aspectRatio={previewImage.aspectRatio}
      />
    </div>
  );
}
