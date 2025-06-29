import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { auth } from '../firebase';
import { signInSuccess, signOut } from '../store/slices/authSlice';
import type { AppDispatch, RootState } from '../store/store';

// Redux hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Auth hook
export const useAuth = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // ローカルストレージからユーザー情報を復元（開発用）
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      dispatch(signInSuccess(user));
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          email: user.email,
          uid: user.uid,
        };
        dispatch(signInSuccess(userData));
        // ローカルストレージに保存（開発用）
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        dispatch(signOut());
        // ローカルストレージから削除
        localStorage.removeItem('user');
      }
    });

    return () => unsubscribe();
  }, [dispatch]);
};
