import { Delete, Edit, Visibility } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import Header from '../components/Header';
import { auth, db } from '../firebase';

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  userId?: string;
  userEmail?: string;
  createdAt: any;
  status: 'new' | 'read' | 'replied';
  reply?: string;
  repliedAt?: any;
}

const AdminContacts = () => {
  const [user] = useAuthState(auth);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [replyDialog, setReplyDialog] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchContacts();
  }, [user]);

  const fetchContacts = async () => {
    try {
      const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const contactsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Contact[];
      setContacts(contactsData);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    contactId: string,
    newStatus: Contact['status']
  ) => {
    try {
      await updateDoc(doc(db, 'contacts', contactId), {
        status: newStatus,
      });
      setContacts(
        contacts.map((contact) =>
          contact.id === contactId ? { ...contact, status: newStatus } : contact
        )
      );
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!window.confirm('このお問い合わせを削除しますか？')) return;

    try {
      await deleteDoc(doc(db, 'contacts', contactId));
      setContacts(contacts.filter((contact) => contact.id !== contactId));
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleReply = async () => {
    if (!selectedContact || !replyText.trim()) return;

    setReplyLoading(true);
    try {
      await updateDoc(doc(db, 'contacts', selectedContact.id), {
        status: 'replied',
        reply: replyText.trim(),
        repliedAt: serverTimestamp(),
      });

      setContacts(
        contacts.map((contact) =>
          contact.id === selectedContact.id
            ? { ...contact, status: 'replied', reply: replyText.trim() }
            : contact
        )
      );

      setReplyDialog(false);
      setReplyText('');
      setSelectedContact(null);
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setReplyLoading(false);
    }
  };

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'new':
        return 'error';
      case 'read':
        return 'warning';
      case 'replied':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: Contact['status']) => {
    switch (status) {
      case 'new':
        return '新規';
      case 'read':
        return '既読';
      case 'replied':
        return '返信済み';
      default:
        return '不明';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '不明';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('ja-JP');
  };

  if (!user) {
    return (
      <>
        <Header />
        <Box sx={{ textAlign: 'center', mt: 14 }}>
          <Typography variant="h6">ログインが必要です</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header />
      <Box sx={{ width: '95%', mx: 'auto', mt: 14, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
          📧 お問い合わせ管理
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>日時</TableCell>
                  <TableCell>名前</TableCell>
                  <TableCell>メール</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>{formatDate(contact.createdAt)}</TableCell>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(contact.status)}
                        color={getStatusColor(contact.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          setSelectedContact(contact);
                          setReplyDialog(true);
                        }}
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        onClick={() => handleStatusChange(contact.id, 'read')}
                        size="small"
                        disabled={contact.status === 'read'}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(contact.id)}
                        size="small"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* 詳細・返信ダイアログ */}
        <Dialog
          open={replyDialog}
          onClose={() => setReplyDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            お問い合わせ詳細
            {selectedContact && (
              <Chip
                label={getStatusText(selectedContact.status)}
                color={getStatusColor(selectedContact.status) as any}
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </DialogTitle>
          <DialogContent>
            {selectedContact && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedContact.name} 様
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  メール: {selectedContact.email}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  日時: {formatDate(selectedContact.createdAt)}
                </Typography>

                <Paper sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    お問い合わせ内容:
                  </Typography>
                  <Typography variant="body1">
                    {selectedContact.message}
                  </Typography>
                </Paper>

                {selectedContact.reply && (
                  <Paper sx={{ p: 2, mt: 2, backgroundColor: '#e8f5e8' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      返信内容:
                    </Typography>
                    <Typography variant="body1">
                      {selectedContact.reply}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      返信日時: {formatDate(selectedContact.repliedAt)}
                    </Typography>
                  </Paper>
                )}

                {selectedContact.status !== 'replied' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="返信内容"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    sx={{ mt: 2 }}
                    placeholder="返信内容を入力してください..."
                  />
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReplyDialog(false)}>閉じる</Button>
            {selectedContact && selectedContact.status !== 'replied' && (
              <Button
                onClick={handleReply}
                variant="contained"
                disabled={!replyText.trim() || replyLoading}
              >
                {replyLoading ? '送信中...' : '返信する'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default AdminContacts;
