import { forwardRef, useImperativeHandle, useRef } from "react";

export interface DialogRef {
    open: () => void;
    close: () => void;
}

export const Dialog = forwardRef<DialogRef, { children: React.ReactNode }>(
    ({ children }, ref) => {
        const dialogRef = useRef<HTMLDialogElement>(null);

        const handleClose = () => dialogRef.current?.close();

        const handleOverlayClick = (e: React.MouseEvent<HTMLDialogElement>) => {
            const dialog = dialogRef.current;
            if (!dialog) return;
            const rect = dialog.getBoundingClientRect();
            const isInDialog =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;
            if (!isInDialog) { handleClose(); }
        };

        useImperativeHandle(ref, () => ({
            open: () => dialogRef.current?.showModal(),
            close: handleClose,
        }));

        return (
            <dialog
                ref={dialogRef}
                onClick={handleOverlayClick}
                style={{ border: "none", padding: 0 }}
            >
                {children}
            </dialog>
        );
    }
);
