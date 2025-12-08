import { useState, useCallback } from 'react';

export const useSnackbar = () => {
    const [snackbar, setSnackbar] = useState({
        isOpen: false,
        message: '',
        type: 'info'
    });

    const showSnackbar = useCallback((message, type = 'info') => {
        setSnackbar({
            isOpen: true,
            message,
            type
        });
    }, []);

    const hideSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, isOpen: false }));
    }, []);

    return {
        snackbar,
        showSnackbar,
        hideSnackbar
    };
};

export const useConfirmDialog = () => {
    const [dialog, setDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    });

    const showConfirmDialog = useCallback((title, message, onConfirm, type = 'danger') => {
        setDialog({
            isOpen: true,
            title,
            message,
            onConfirm,
            type
        });
    }, []);

    const hideConfirmDialog = useCallback(() => {
        setDialog(prev => ({ ...prev, isOpen: false }));
    }, []);

    return {
        dialog,
        showConfirmDialog,
        hideConfirmDialog
    };
};
