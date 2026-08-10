import { useNavigate } from 'react-router-dom';
import CMSDashboard from '../components/CMSDashboard';

export default function CMSPage() {
  const navigate = useNavigate();

  const handleClose = () => {
    localStorage.removeItem('castle_passcode');
    navigate('/');
  };

  return (
    <main className="relative pt-[72px]">
      <CMSDashboard onClose={handleClose} />
    </main>
  );
}
