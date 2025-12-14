import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheckCircle,
    faTimes,
    faSignInAlt,
    faUserCheck
} from "@fortawesome/free-solid-svg-icons";
import Button from "../UI/Button/Button";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    icon?: any;
    autoClose?: boolean;
    autoCloseDelay?: number;
    showCloseButton?: boolean;
    onConfirm?: () => void;
    confirmText?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
    isOpen,
    onClose,
    title = "Success!",
    message = "Operation completed successfully.",
    icon = faCheckCircle,
    autoClose = false,
    autoCloseDelay = 3000,
    showCloseButton = true,
    onConfirm,
    confirmText = "Continue"
}) => {
    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, autoCloseDelay, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
                {showCloseButton && (
                    <button
                        className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}

                <div className="flex flex-col items-center p-8 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                        <FontAwesomeIcon icon={icon} className="text-3xl text-white" />
                    </div>

                    <div className="mb-6">
                        <h2 className="mb-2 text-2xl font-bold text-slate-900">{title}</h2>
                        <p className="text-slate-600">{message}</p>
                    </div>

                    {autoClose && (
                        <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full w-full bg-gradient-to-r from-blue-600 to-blue-500 animate-[shrink_linear_forwards]"
                                style={{ 
                                    animationDuration: `${autoCloseDelay}ms`
                                }}
                            />
                        </div>
                    )}

                    <div className="w-full">
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleConfirm}
                            icon={faSignInAlt}
                            fullWidth
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;