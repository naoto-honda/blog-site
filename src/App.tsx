import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Header from './components/Header';
import { PrivateRoute } from './components/PrivateRoute';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './hooks/redux';
import About from './pages/About';
import ArticleDetail from './pages/ArticleDetail';
import Articles from './pages/Articles';
import Contact from './pages/Contact';
import CreatePost from './pages/CreatePost';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import { store } from './store/store';

const theme = createTheme({
  typography: {
    fontFamily: ['Quicksand', 'Noto Sans JP', 'Yu Gothic', 'sans-serif'].join(
      ','
    ),
  },
});

// Reduxストアの外側でuseAuthを使用するためのラッパーコンポーネント
const AppContent = () => {
  useAuth(); // 認証状態の監視を開始

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* 公開ルート */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* 保護されたルート */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <Home />
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/about"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <About />
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/articles/:id"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <ArticleDetail />
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/articles"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <Articles />
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/articles/new"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <CreatePost />
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/articles/:id/edit"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <CreatePost />
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <Contact />
                </>
              </PrivateRoute>
            }
          />

          {/* 404 エラーページ - 最後に配置 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
