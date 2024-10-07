import { useEvent } from 'react-use';

export const useWindowEvents = () => {
    useEvent('beforeunload', (event: BeforeUnloadEvent) => {
        (event || window.event).returnValue = 'Are you sure you want to leave?';
    });
};
