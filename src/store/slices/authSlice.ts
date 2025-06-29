import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// カスタムユーザー型の定義
interface UserData {
  email: string | null;
  uid: string;
}

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action: PayloadAction<UserData>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    signInFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    signOut: (state) => {
      return initialState;
    },
    // 新しいアクション: Firebase認証状態の同期用
    setUser: (state, action: PayloadAction<UserData | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    },
  },
});

export const { signInStart, signInSuccess, signInFailure, signOut, setUser } =
  authSlice.actions;
export default authSlice.reducer;
