import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export const useProjectNamePrompt = (
    title: string,
    message: string
): [() => JSX.Element, () => Promise<string | null>] => {
    const [promise, setPromise] = useState<{
        resolve: (value: string | null) => void;
    } | null>(null);
    const [projectName, setProjectName] = useState('');

    const prompt = () =>
        new Promise<string | null>((resolve) => {
            setPromise({ resolve });
        });

    const handleClose = () => {
        setPromise(null);
        setProjectName(''); // Reset the input when closing
    };

    const handleConfirm = () => {
        promise?.resolve(projectName);
        handleClose();
    };

    const handleCancel = () => {
        promise?.resolve(null);
        handleClose();
    };

    const ProjectNameDialog = () => (
        <Dialog
            open={promise !== null}
            onOpenChange={(open) => {
                if (!open) handleCancel();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{message}</DialogDescription>
                </DialogHeader>
                <div className="pt-4">
                    <Input
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Enter project name"
                    />
                </div>
                <DialogFooter className="pt-2">
                    <Button onClick={handleCancel} variant="outline">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={!projectName}>
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return [ProjectNameDialog, prompt];
};
