const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1e8 
});


const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/whatsapp_db';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: null }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const statusSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    caption: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now, expires: 86400 }
});

const Status = mongoose.model('Status', statusSchema);

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, profilePic } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            profilePic: profilePic || null
        });
        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, username: newUser.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: newUser._id, username: newUser.username, email: newUser.email, profilePic: newUser.profilePic }
        });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password.' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }
        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, username: user.username, email: user.email, profilePic: user.profilePic }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

let activeUsers = [];
let kbcPolls = {};

io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication token missing'));

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const dbUser = await User.findById(decoded.id);
        if (!dbUser) return next(new Error('User not found'));

        socket.user = {
            id: dbUser._id.toString(),
            username: dbUser.username,
            profilePic: dbUser.profilePic
        };
        next();
    } catch (err) {
        return next(new Error('Invalid or expired token'));
    }
});

io.on('connection', (socket) => {
    console.log(`[Connected]: ${socket.user.username} (Socket ID: ${socket.id})`);

    activeUsers = activeUsers.filter(u => u.userId !== socket.user.id);
    activeUsers.push({
        socketId: socket.id,
        userId: socket.user.id,
        username: socket.user.username,
        profilePic: socket.user.profilePic
    });

    io.emit('update userlist', activeUsers);

    socket.on('private message', ({ recipientSocketId, message, file, location, kbcPoll }) => {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let pollData = null;
        if (kbcPoll) {
            const pollId = 'kbc_' + Date.now();
            pollData = {
                id: pollId,
                question: kbcPoll.question,
                options: kbcPoll.options.map(opt => ({ text: opt, votes: 0 })),
                correctOptionIndex: kbcPoll.correctOptionIndex,
                totalVotes: 0,
                votedUsers: {}
            };
            kbcPolls[pollId] = pollData;
        }

        const messagePayload = {
            senderSocketId: socket.id,
            senderUserId: socket.user.id,
            recipientSocketId,
            message: message || '',
            file: file || null,
            location: location || null,
            kbcPoll: pollData,
            time: timestamp
        };

        io.to(recipientSocketId).emit('private message', messagePayload);
        socket.emit('private message', messagePayload);
    });

    socket.on('kbc vote', ({ pollId, optionIndex, recipientSocketId }) => {
        const poll = kbcPolls[pollId];
        if (poll) {
            if (!poll.votedUsers[socket.user.id]) {
                poll.votedUsers[socket.user.id] = optionIndex;
                poll.options[optionIndex].votes += 1;
                poll.totalVotes += 1;

                const updatePayload = {
                    pollId,
                    pollData: poll,
                    voterUserId: socket.user.id,
                    selectedOptionIndex: optionIndex
                };

                io.to(recipientSocketId).emit('kbc vote update', updatePayload);
                socket.emit('kbc vote update', updatePayload);
            }
        }
    });

    socket.on('typing', ({ recipientSocketId, isTyping }) => {
        io.to(recipientSocketId).emit('typing', { senderSocketId: socket.id, isTyping });
    });

    socket.on('upload status', async ({ mediaUrl, caption }) => {
        try {
            const newStatus = new Status({ userId: socket.user.id, username: socket.user.username, mediaUrl, caption });
            await newStatus.save();
            const statuses = await Status.find().populate('userId', 'username profilePic').sort({ createdAt: -1 });
            io.emit('update status list', statuses);
        } catch (err) {
            console.error('Status Upload Error:', err);
        }
    });

    socket.on('get statuses', async () => {
        try {
            const statuses = await Status.find().populate('userId', 'username profilePic').sort({ createdAt: -1 });
            socket.emit('update status list', statuses);
        } catch (err) {
            console.error('Get Status Error:', err);
        }
    });

    socket.on('call-user', ({ to, offer }) => {
        io.to(to).emit('incoming-call', { from: socket.id, callerName: socket.user.username, offer });
    });

    socket.on('make-answer', ({ to, answer }) => {
        io.to(to).emit('call-accepted', { from: socket.id, answer });
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
        io.to(to).emit('ice-candidate', { from: socket.id, candidate });
    });

    socket.on('end-call', ({ to }) => {
        io.to(to).emit('call-ended');
    });

    socket.on('disconnect', () => {
        console.log(`[Disconnected]: ${socket.user.username}`);
        activeUsers = activeUsers.filter(u => u.socketId !== socket.id);
        io.emit('update userlist', activeUsers);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
