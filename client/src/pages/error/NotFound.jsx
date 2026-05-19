import { Link } from 'react-router-dom';
import { Button, Card } from '../../components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card padding="lg" className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-brand-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-slate-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button>Go to Dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}
