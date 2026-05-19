import { Link } from 'react-router-dom';
import { Button, Card } from '../../components/ui';

export default function ServerError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card padding="lg" className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
        <h2 className="text-2xl font-semibold mb-2">Server Error</h2>
        <p className="text-slate-600 mb-6">
          Something went wrong on our end. Please try again later.
        </p>
        <Link to="/">
          <Button>Go to Dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}
