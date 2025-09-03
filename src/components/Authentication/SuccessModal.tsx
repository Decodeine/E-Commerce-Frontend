import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheckCircle,
    faTimes,
    faSignInAlt,
    faUserCheck
} from "@fortawesome/free-solid-svg-icons";
import Button from "../UI/Button/Button";
import "./css/SuccessModal.css";

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
        <div className="success-modal-overlay" onClick={handleBackdropClick}>
            <div className="success-modal">
                {showCloseButton && (
                    <button
                        className="success-modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}

                <div className="success-modal-content">
                    <div className="success-modal-icon">
                        <FontAwesomeIcon icon={icon} />
                    </div>

                    <div className="success-modal-text">
                        <h2>{title}</h2>
                        <p>{message}</p>
                    </div>

                    {autoClose && (
                        <div className="success-modal-progress">
                            <div
                                className="progress-bar"
                                style={{ animationDuration: `${autoCloseDelay}ms` }}
                            />
                        </div>
                    )}

                    <div className="success-modal-actions">
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleConfirm}
                            icon={faSignInAlt}
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