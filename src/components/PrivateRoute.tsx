// ログインしていない場合はログインページにリダイレクト
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  // 認証状態確認中は何も表示しない（またはローディングスピナーを表示）
  if (loading) {
    return null; // または <LoadingSpinner />
  }

  // 未認証の場合はログインページにリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 認証済みの場合は子コンポーネントを表示
  return <>{children}</>;
};
