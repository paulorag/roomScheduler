"use client";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isDanger = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
                <div className={`p-5 ${isDanger ? "bg-red-50 border-b border-red-100" : "bg-indigo-50 border-b border-indigo-100"}`}>
                    <h3 className={`text-lg font-bold ${isDanger ? "text-red-800" : "text-indigo-900"}`}>
                        {title}
                    </h3>
                </div>

                <div className="p-6">
                    <p className="text-slate-600 text-sm leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 mt-6 justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-semibold cursor-pointer"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className={`px-4 py-2 text-white rounded-lg transition text-sm font-semibold cursor-pointer ${
                                isDanger
                                    ? "bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-200"
                                    : "bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200"
                            }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
