import './globals.css';
import { ToastProvider } from '@/hooks/useToast';
import Toasts from '@/components/UI/Toasts';

// ... other imports

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
          <Toasts />
        </ToastProvider>
      </body>
    </html>
  );
}
